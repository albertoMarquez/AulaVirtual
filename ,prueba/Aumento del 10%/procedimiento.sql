create or replace PROCEDURE aumentarSueldo(fechaIni DATE, aporcentaje number) as
  numEmpl number;
 begin
  SELECT COUNT(*) INTO numEmpl FROM empleados WHERE fechaingreso <= fechaIni;
  IF numEmpl > 0 THEN
    UPDATE empleados SET sueldo=sueldo+(sueldo*aporcentaje/100)
    where  fechaingreso <= fechaIni;
  ELSE
    DBMS_OUTPUT.PUT_LINE('No hay empleados anteriores a esta fecha.');
  END IF;
END;