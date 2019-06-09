
# AulaVirtual

Acceso al sistema en la siguiente dirección: 
http://147.96.80.139:3000

Profesor: p@ucm.es
Pass: a

Alumno: alberto@ucm.es
Pass: a

Aprender a programar en un lenguaje procedural de base de datos SQL/PSM, tiene una
complejidad mayor al aprendizaje de un lenguaje de programación de propósito
general. Por una parte, para realizar programas sencillos se requiere construir
previamente la estructura de la base de datos que va a utilizar el programa que se quiere
desarrollar. Además, es necesario introducir un conjunto de datos apropiado que
produzca resultados significativos al ejecutar el procedimiento almacenado. Y por último
se debe comprobar que los resultados son correctos, lo que no es tan sencillo como en un
programa de consola, pues además de comparar la salida del programa, deben verificarse
las posibles modificaciones en los datos de la base de datos.

Todo este proceso lo deben realizar los alumnos para implementar sus primeros
programas. Una herramienta automática que facilitara estas tareas y que además pudiera
verificar la corrección de los programas de los alumnos sería de gran utilidad en las
asignaturas de bases de datos.
Este proyecto facilita la implicación del alumno a la hora de aprender a desarrollar código
en PL/SQL, resolviendo el problema de comprobar si un procedimiento es correcto o no.
Se facilita la tarea de tener que instalar un cliente para ejecutar dichos procedimientos
como es sql developer y la tediosa tarea de crear y rellenar las tablas de la base de datos.

Además, un factor muy importante para el aprendizaje es la realimentación: que el alumno
pueda aprovechar posibles comentarios que pueda ofrecerle el profesor sobre el código
del alumno cuando corrija manualmente los ejercicios entregados. Desafortunadamente,
por falta de tiempo en la mayor parte de los casos los profesores no pueden corregir los
ejercicios delante de sus alumnos para indicarles cómo pueden mejorarlos. Sería muy
deseable disponer de una herramienta en la que el profesor podrá poner comentarios a
una entrega hecha por el alumno para poder ayudarle y guiarle en los casos en los que no
encuentre una solución válida. Además, podrá calificarle y ponerle nota hasta tantas veces
como el alumno necesite.
Esta herramienta da apoyo tanto a profesores como a alumnos a la hora de resolver
problemas de PL/SQL. Con una sencilla e intuitiva página web que utiliza una base de
datos en el servidor web para guardar toda la información relacionada con asignaturas, 
alumnos, grupos y ejercicios, además de conectarse a un servidor de bases de datos
externo (en nuestro caso Oracle) para ejecutar los procedimientos almacenados SQL/PSM
(PL/SQL).
Parte de funcionalidad tiene similitud con muchos jueces en línea que se pueden encontrar
en internet además de los que se usan en otras asignaturas, como DomJudge o el juez de
la Universidad de Valladolid. Sin embargo, la dificultad de esta herramienta se
encuentra en que no compara resultados uno a uno como hacen otros jueces. Esta crea un
entorno de prueba en el servidor Oracle con tablas y datos propios de cada ejercicio,
almacena el procedimiento del alumno y ejecuta unos scripts de prueba.
