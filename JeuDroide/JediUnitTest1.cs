namespace TestJeuDroides
{
    [TestClass]
    public class JediUnitTest1
    {
        [TestMethod]
        public void TestMAttaquertoutEstOk()
        {
            ExampleJedi.Jedi jedi =new ExampleJedi.Jedi();
            ExampleJedi.Droide droide = new ExampleJedi.Droide()
            {
                PointsDeVie = 100
            };

            jedi.Attaquer(droide);
            Assert.IsTrue(droide.PointsDeVie == 50);
        }
    }
}