create or replace procedure pa_empleados_aumentarsueldo
 as
 begin
  update empleados set sueldo=sueldo+(sueldo*10/100);
 end;
 