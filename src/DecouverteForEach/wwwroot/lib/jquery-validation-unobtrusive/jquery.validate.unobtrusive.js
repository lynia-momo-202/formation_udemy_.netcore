// Unobtrusive validation support library for jQuery and jQuery Validate
// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
// @version v3.2.11

/*jslint white: true, browser: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: false */
/*global document: false, jQuery: false */

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define("jquery.validate.unobtrusive", ['jquery-validation'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS-like environments that support module.exports     
        module.exports = factory(require('jquery-validation'));
    } else {
        // Browser global
        jQuery.validator.unobtrusive = factory(jQuery);
    }
}(function ($) {
    var $jQval = $.validator,
        adapters,
        data_validation = "unobtrusiveValidation";

    function setValidationValues(options, ruleName, value) {
        options.rules[ruleName] = value;
        if (options.message) {
            options.messages[ruleName] = options.message;
        }
    }

    function splitAndTrim(value) {
        return value.replace(/^\s+|\s+$/g, "").split(/\s*,\s*/g);
    }

    function escapeAttributeValue(value) {
        // As mentioned on http://api.jquery.com/category/selectors/
        return value.replace(/([!"#$%&'()*+,./:;<=>?@\[\\\]^`{|}~])/g, "\\$1");
    }

    function getModelPrefix(fieldName) {
        return fieldName.substr(0, fieldName.lastIndexOf(".") + 1);
    }

    function appendModelPrefix(value, prefix) {
        if (value.indexOf("*.") === 0) {
            value = value.replace("*.", prefix);
        }
        return value;
    }

    function onError(error, inputElement) {  // 'this' is the form element
        var container = $(this).find("[data-valmsg-for='" + escapeAttributeValue(inputElement[0].name) + "']"),
            replaceAttrValue = container.attr("data-valmsg-replace"),
            replace = replaceAttrValue ? $.parseJSON(replaceAttrValue) !== false : null;

        container.removeClass("field-validation-valid").addClass("field-validation-error");
        error.data("unobtrusiveContainer", container);

        if (replace) {
            container.empty();
            error.removeClass("input-validation-error").appendTo(container);
        }
        else {
            error.hide();
        }
    }

    function onErrors(event, validator) {  // 'this' is the form element
        var container = $(this).find("[data-valmsg-summary=true]"),
            list = container.find("ul");

        if (list && list.length && validator.errorList.length) {
            list.empty();
            container.addClass("validation-summary-errors").removeClass("validation-summary-valid");

            $.each(validator.errorList, function () {
                $("<li />").html(this.message).appendTo(list);
            });
        }
    }

    function onSuccess(error) {  // 'this' is the form element
        var container = error.data("unobtrusiveContainer");

        if (container) {
            var replaceAttrValue = container.attr("data-valmsg-replace"),
                replace = replaceAttrValue ? $.parseJSON(replaceAttrValue) : null;

            container.addClass("field-validation-valid").removeClass("field-validation-error");
            error.removeData("unobtrusiveContainer");

            if (replace) {
                container.empty();
            }
        }
    }

    function onReset(event) {  // 'this' is the form element
        var $form = $(this),
            key = '__jquery_unobtrusive_validation_form_reset';
        if ($form.data(key)) {
            return;
        }
        // Set a flag that indicates we're currently resetting the form.
        $form.data(key, true);
        try {
            $form.data("validator").resetForm();
        } finally {
            $form.removeData(key);
        }

        $form.find(".validation-summary-errors")
            .addClass("validation-summary-valid")
            .removeClass("validation-summary-errors");
        $form.find(".field-validation-error")
            .addClass("field-validation-valid")
            .removeClass("field-validation-error")
            .removeData("unobtrusiveContainer")
            .find(">*")  // If we were using valmsg-replace, get the underlying error
            .removeData("unobtrusiveContainer");
    }

    function validationInfo(form) {
        var $form = $(form),
            result = $form.data(data_validation),
            onResetProxy = $.proxy(onReset, form),
            defaultOptions = $jQval.unobtrusive.options || {},
            execInContext = function (name, args) {
                var func = defaultOptions[name];
                func && $.isFunction(func) && func.apply(form, args);
            };

        if (!result) {
            result = {
                options: {  // options structure passed to jQuery Validate's validate() method
                    errorClass: defaultOptions.errorClass || "input-validation-error",
                    errorElement: defaultOptions.errorElement || "span",
                    errorPlacement: function () {
                        onError.apply(form, arguments);
                        execInContext("errorPlacement", arguments);
                    },
                    invalidHandler: function () {
                        onErrors.apply(form, arguments);
                        execInContext("invalidHandler", arguments);
                    },
                    messages: {},
                    rules: {},
                    success: function () {
                        onSuccess.apply(form, arguments);
                        execInContext("success", arguments);
                    }
                },
                attachValidation: function () {
                    $form
                        .off("reset." + data_validation, onResetProxy)
                        .on("reset." + data_validation, onResetProxy)
                        .validate(this.options);
                },
                validate: function () {  // a validation function that is called by unobtrusive Ajax
                    $form.validate();
                    return $form.valid();
                }
            };
            $form.data(data_validation, result);
        }

        return result;
    }

    $jQval.unobtrusive = {
        adapters: [],

        parseElement: function (element, skipAttach) {
            /// <summary>
            /// Parses a single HTML element for unobtrusive validation attributes.
            /// </summary>
            /// <param name="element" domElement="true">The HTML element to be parsed.</param>
            /// <param name="skipAttach" type="Boolean">[Optional] true to skip attaching the
            /// validation to the form. If parsing just this single element, you should specify true.
            /// If parsing several elements, you should specify false, and manually attach the validation
            /// to the form when you are finished. The default is false.</param>
            var $element = $(element),
                form = $element.parents("form")[0],
                valInfo, rules, messages;

            if (!form) {  // Cannot do client-side validation without a form
                return;
            }

            valInfo = validationInfo(form);
            valInfo.options.rules[element.name] = rules = {};
            valInfo.options.messages[element.name] = messages = {};

            $.each(this.adapters, function () {
                var prefix = "data-val-" + this.name,
                    message = $element.attr(prefix),
                    paramValues = {};

                if (message !== undefined) {  // Compare against undefined, because an empty message is legal (and falsy)
                    prefix += "-";

                    $.each(this.params, function () {
                        paramValues[this] = $element.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            � 	�          	�   �    ����˨D3i���{�
� �f������ymaUI<0$
�����
R
�0#%�������vi]QD7+��pdWJ���������5)
�
F
:
-	�	�	�	�	�	�	}������tgZM@4(�yl_RE8������ui\Ov������	�
�
�
�
w
j	�
!

	�
�
�
�
�
�����	q	e	X	K	>	1	$��	�
^�sfYL,����������=		����� ���dYMB7+�������sg[NA5)������������C7*������{obUH<0#	�����sffffffffffffffffffffffffffffffffff]QD7            ?� �sust	sssr����	��	c�c�_�_�_�_�	_�_�K�K�K�	K�K���	��?�	?�?�<<	<<0�0�0�	0�0� � �	 � �%�	%�%� C B	 A @oo +�+�+�+�	+�+������������	����ba`	_^����	�������	�� �� ��	 �� �� ��	 �� ��	 �� ��	 �� ��"�"�	"�"�	 �� �� ��	 �� ��
	d�
d�O�
	O�
O�A  �����	��	� ���	��������	������������	���������	�~�}&�&�&�&�&�	&�&������	���n�m�l�k�j	�i�h
�	��
�
�
�	
�E	DC�	���������	��	�������	�����$� �������
�		�����	�� ����"�s�s�	s�s�� � I	�� � �  	c�c�� 2�� �&?�	?�?�<�<�	<�<�0�0�0�	0�0�2 2�6�2 �6��%�	%�%�  ~	 } | � �f-�� f-�w� dv� Wu� J	t� >s� 2f-�� 	f-�� f-�ihg	fe �� ��	 �� �� ��	 �� ��	 �� ��	 �� ��   2f-�   f-�   f-�	 �� � ��	 �� ��   �    ����˨D�ȭݠhA
V � k�M+;��D�H�	�8
NN�d������W5E��N�R�	�z
DX �n�� ��X	�
:b*��
����~aC�!�1���\��:�#f�	�.
l
&D�Z�����
vz4l�Y�0��	�
0
����
�pt�t��9������\�bx�B
�
�
���OR����H>����p�v~&�>$
�
b
X
�
�`j��}si��L��f��'�*
�	,�	4
�	6(� 
�
	�	�	|	T	"	P2����0��
	J:	r	�F<		h�	^�	@
	�	�
�	��	�lv����
	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�	�                                                                                                                                                                                                                                                                                                                
v nY�
v dX�
� Z �
� P �~
� F �}
� <2|
� 2Y{� (Xz� �� �� 
 ��	�n	�m	 �l	 �k	 �j	 �i	 �h	
�	 ��	��	 �}	#�	 ��	 ��	 ��	 ��	 ��	
�		E	 �D	
C	 ��	 ��	 ��	 ��	 ��	 ��	 ��	 ��	��	 ��	 ��	
�	 ��	�$	 ��	�	�	 ��	 ��	 ��	�	�	 �	 �	 �	�
	�		 �	
	2�	��	��	 ��	 ��	
�	$�� 
 ��	�	�	 ��	��	 ��	 ��	 ��	 ��	
�	a�	`�	�	 ��,�	 ��	+�	 ��	 ��	 ��	 ��P�	 ��	 ��	 ��	 ��	 ��	 ��	@�	A�	 ��,�	 ��e�	 ��	M�	L�	 ��	 ��	 ��	 �	 ��	 ��	 ��	d�	 ��	 ��	 ��	 ��	 ��	 ��	 ��	 ��	 ��	 ��	
�	 ��� 2��� 
	� � 
 � 	'�	 ��	 ��	 ��	 ��	 ��	&�	#�	 ��	 ��	 ��	 ��	 ��	�	 ��	 ��	�	 ��	 ��	 ��	 ��	 ��	 ��	 ��	 ��	 ��	 ��	uu	tt	2s	 �r	b	a	 �`	
_	 �^	 ��	 ��	 ��	 ��	 ��	�	�	 ��	 ��	 ��	�	�	 ��	
�	!C	 �B	 �A	 �@	�		�	 ��	�	��	��	=	 �	 �	 �	u�	t�	2�	 ��	,�	 ��	 ��	 ��	 ��	(�	d�	 ��� 	Y	 ��	
�	 ��	 �	 �~- 
(	
�	��	��	��	 ��� <h�	��� ( ��	 � �� 
 � 	�	�	�	 ��	��	 ( ��	  ��	  ��	 
#�	A�	@�	 ��	=�	 ��	 ��	 ��c (.�c  ��	h�c 
g�	 ��	 ��	 ��	+�	 ��� P ��	�u� <�t� 2 �s� ( ���  ��	U�� 
T�	&�	 ��	#�? F�� <�� 2 ��� ( ���  ���  ��� 
 ��	!	 �~	 �}	 �|� Z{�  �z�  �y� 
 �x	w� (v�  �u� 
t� 
 �s	i	 �h	 �g	f	 �e� nd	 �c   Z �b   P �a   F �_   <�   2�   ( ��    ��    ��   

�	 ��	 ��	 ��	 ��	 ��,�	 ��	 ��	 ��	 ��	 ��   ( ��    ��    ��   
 ��	 ��	 �	 ��	 ��	 ��   �    ����˨D��^�L�n
F �~ �	<��	K�q���"�
�	�	r����n~
�.r	F�	���	�
Jj�y