﻿namespace ExampleJedi
{
    public class Jedi
    {
        public int PointsDeVie { get; set; }
        public void Attaquer(Droide droide)
        {
            if (droide != null) 
            {
                droide.PointsDeVie -= 50;
            }
        }
    }
}