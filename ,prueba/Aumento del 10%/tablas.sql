create table empleados(
  documento char(8),
  nombre varchar2(20),
  apellido varchar2(20),
  sueldo number(6,2),
  fechaingreso date
 );

 insert into empleados values('22222222','Juan','Perez',300,'10/10/1980');
 insert into empleados values('22333333','Luis','Lopez',300,'12/05/1998');
 insert into empleados values('22444444','Marta','Perez',500,'25/08/1990');
 insert into empleados values('22555555','Susana','Garcia',400,'05/05/2000');
 insert into empleados values('22666666','Jose Maria','Morales',400,'24/10/2005');