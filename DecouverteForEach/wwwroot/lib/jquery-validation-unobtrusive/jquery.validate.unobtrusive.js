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
                        paramValues[this] = $element.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            § 	î          	ó   ß    ’´ „À®D3içîó{À
€ ÙfÙË€œ√ÖymaUI<0$
˛ÚÂÿÀ
R
Í0#%ˇÛÁ⁄úêÉvi]QD7+‘»pdWJÚÊŸÃø≥ßöç5)
ˆ
F
:
-	 	æ	±	§	ó	ä	}ø≥¶ôåÄtgZM@4(Öyl_RE8ˆÍ›–êÉui\Ov¬≠°îá∂	‚
û
ë
Ñ
w
j	÷
!

	˙
ﬁ
“
≈
∏
´ıÈ‹œ	q	e	X	K	>	1	$©ù	Ó
^ÄsfYL,ÿÃø≤•òÓ‚’»=		ˇÚÂÿÀ ˙Ì‡dYMB7+˙º∞§òåÄsg[NA5)ƒ∏´ûëÃ¿≥¶öéÅC7*¯Îﬁ“∆π{obUH<0#	¸‰åÄsffffffffffffffffffffffffffffffffff]QD7            ?– ∏sust	sssrÂ‰„‚	·‡	c≤c±_›_‹_€_⁄	_Ÿ_ÿKªK∫Kπ	K∏K∑¥≥	≤±?∆	?≈?ƒ<<	<<0÷0’0‘	0◊0” ∏ ∑	 ∂ µ%ñ	%î%ï C B	 A @oo +¯+˜+ˆ+ı	+Ù+ÛÊÌ°Ì†ÌüÌûÌù	ÌúÌõba`	_^¸Æ¸≠	¸¨¸´èéç	åã ˚ì ˚í	 ˚ë ˚ê ˜≠	 ˜¨ ˜´	 ÙÉ ÙÇ	 Òæ Òø"ﬁ"›	"‹"€	 Îä Îâ Ñ∞	 ÑØ ÑÆ
	dΩ
dºO“
	O—
O–A  π¸∞¸Ø	⁄Ÿ	ª ∫—–	œŒ‰ã‰ä‰â	‰à‰á‡ë‡ê‡è‡é	‡ç‡å‹Å‹Ä‹	‹~‹}&Ì&Ï&Î&Í&È	&Ë&ÁÕÃÀ …	»«–n–m–l–k–j	–i–h
¬	º“
∆
≈
ƒ	
√E	DCÓ	”¡¿øæΩ˝¸˚	˙˘	ÔŒÜŒÖŒÑ	ŒÉŒÇÀ$˛ ≤ÿ◊÷’‘¨
¨		¨¨®®®	®® ˛ÚÒ"ﬂs›s‹	s€s⁄∫ ‡ I	ˇ‡ ‡ ‡  	c–cœ® 2˛® ˛&?°	?†?ü<û<ù	<ú<õ0ñ0ï0î	0ì0í2 2È6˛2 È6˝˛%â	%à%á  ~	 } | ë ôf-Îô f-Íwë dvë Wuë J	të >së 2f-Óë 	f-Ìë f-Ïihg	fe ˚∂ ˚µ	 ˚¥ ˚≥ ˜á	 ˜Ü ˜Ö	 Ùâ Ùà	 Ò≤ Ò±   2f-Ò   f-   f-Ô	 ÎÄ Î ÑÙ	 ÑÛ Ñı   ©    ’´ „À®D∑»≠›†hA
V Ù kÏM+;ı DÁHú	Æ8
NN¨d≤ûˆ‹ÑˆW5Eˇ‘NÄR¶	∏z
DX Ónº® ÊéX	¬
:b*¯à
Ä‚ÿú~aC≠!Ω1Î◊¨\ﬁ⁄:›#fí	§.
l
&D¢ZÇîÏ“
vz4l£Y¸0”ø	ö
0
Óòá»
ûptŒtíà9¡∑ô‰…˚\∞bx∆B
®
î
ä«≥OR·Õ√¢H>¿∂ÚËp–v~&ë>$
¯
b
X
⁄
‰`jéÑ}si‚äLæòfä‚'ù*
∆	,Œ	4
–	6(ƒ 
º
	Í	ê	|	T	"	P2ÿ¶ìÄ0ˇÎ
	J:	r	ÜF<		hÿ	^Œ	@
	˛	Ù
≤	˙ı	‡lv∫∞ƒ∫
	÷	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã	Ã                                                                                                                                                                                                                                                                                                                
v nYÅ
v dXÄ
Ä Z ·
ä P ‹~
î F ›}
û <2|
® 2Y{∂ (XzÇ ùÇ úå 
 ·õ	“n	—m	 ‰l	 ·k	 ‹j	 ›i	 ‡h	
´	 ‚⁄	 Ÿ	 ›}	#ﬁ	 ·›	 ‹‹	 ›€	 ‹‘	 ›”	
“		E	 ·D	
C	 ›»	 ‡«	 ‰∆	 ·≈	 ‹ƒ	 ›√	 ‡¬	 ·˘	Âã	 ‹ä	 ›â	
à	 ·á	Ã$	 ›¨	Õ	Ã	 ‰À	 · 	 ‹…	™	©	 ‹	 ›	 ·	Æ
	≠		 ‰	
	2±	˝∞	˛Ø	 ·Æ	 ‹≠	
‡	$ﬂå 
 ·˛	˝	¸	 ‰˚	Œ˙	 ‡Á	 ·è	 ‹é	 ›ç	
å	a›	`‹	€	 ˛⁄,Ÿ	 ·ÿ	+◊	 ·÷	 ‹’	 ›‘	 ‰”P“	 ·—	 ‰–	 ·æ	 ‹Ω	 ›º	 ‡ª	@∆	A≈	 ·ƒ,ø	 ·æeΩ	 ·º	Mª	L∫	 ›π	 ‹∏	 ·∑	 ‰	 ·„	 ‹‚	 ›·	d≤	 ·±	 ‹∞	 ›Ø	 ·Æ	 ˘≠	 ¯¨	 ·´	 ·—	 ‹–	 ›œ	
Œ	 ·’∂ 2Œˇ∂ 
	∂ ∂ 
 ‰ 	'Ï	 ‰Î	 ·Í	 ‹È	 ›Ë	 ·Ê	&ñ	#ï	 ·î	 ¸ì	 ·í	 ‹ë	 ›ê	è	 ‰é	 ·ç	å	 ˛ã	 Ïä	 ·â	 ıÉ	 ·Ç	 ‰ü	 ·û	 ‹ù	 ›ú	 ‡õ	uu	tt	2s	 ·r	b	a	 ‰`	
_	 ·^	 ·π	 ‰∏	 ‡∑	 ›∂	 ‹µ	¥	≥	 ·≤	 ·Ó	 ‡Û	Ú	Ò	 ‰	
Ô	!C	 ·B	 ‹A	 ›@	¡		¿	 ‰ø	∫	Ô°	Ó†	=	 ·	 ‹	 ›	u›	t‹	2€	 ·⁄	,¯	 ‰˜	 ·ˆ	 ‹ı	 ›Ù	(Ì	d–	 ·œÒ 	Y	 ‰Ç	
Å	 ‰Ä	 ·	 ‹~- 
(	
É	·ê	–Ü	œÖ	 ·Ñõ <hÎ	Í˛õ ( ‰˝	 õ ˇõ 
 ‰ 	Â	ÿ	◊	 ‰÷	‚ë	 ( ·Ô	  ‹Ó	  ›Ì	 
#Ï	A°	@†	 ·ü	=û	 ·ù	 ‹ú	 ›õc (.öc  ·ô	hÒc 
g	 ·ñ	 ‹ï	 ›î	+ì	 ‰í— P ·§	’u— <÷t— 2 ‰s— ( ‹ö˝  ›ô	U¶À 
T•	&â	 ·à	#á? FÜÀ <ÖÀ 2 ‰ÑÀ ( ·ÉÀ  ‹ÇÀ  ›ÅÀ 
 ‡Ä	!	 ·~	 ‹}	 ›|À Z{À  ‹zÀ  ›yÀ 
 ·x	wÀ (vÀ  ‰uÀ 
tÀ 
 ·s	i	 ‰h	 ·g	f	 ˛e¶ nd	 –c   Z œb   P ·a   F ˛_   <º   2ª   ( ·∫    ‹π    ›∏   

∑	 ¸∂	 ·µ	 ‹¥	 ›≥	 ·≤,±	 ıâ	 ·à	 ˘á	 ¯Ü	 ·Ö   ( ÔÑ    ·É    ‹Ç   
 ›Å	 ÏÄ	 ·	 ·ı	 ‹Ù	 ›Û   ™    ’´ „À®Dòò^ÈLän
F Ù~ â	<∂Ì	Kqâ…ë"“
ä	≤	r’÷ûπn~
Ú.r	Fæ	ÍˆÊ	í
Jj¯y