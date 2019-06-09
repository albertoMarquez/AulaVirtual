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

DECLARE
    dinero_ini number  := 0;
    dinero_fin number;
    v_numAvisos INTEGER := 0;
    fechaIni date := '05/05/2000';
BEGIN
    SELECT SUM(sueldo) INTO dinero_ini FROM empleados where fechaingreso <=  fechaIni;--TO_DATE(fechaIni,'DD-MM-YYYY');
    dinero_ini := dinero_ini+(dinero_ini*10/100);
    dbms_output.enable(100000);
    DBMS_OUTPUT.PUT_LINE('-- --------------------------------------------------------------');
    DBMS_OUTPUT.PUT_LINE('-- PRUEBA 1: Ejecucion correcta del procedimiento.');
    DBMS_OUTPUT.PUT_LINE('-- Ejecucion con datos, comprobacion de calculos y de excepciones.');
    DBMS_OUTPUT.PUT_LINE('-- --------------------------------------------------------------');
    DBMS_OUTPUT.PUT_LINE('-- ');
    aumentarSueldo(fechaIni,10);
    SELECT SUM(sueldo) INTO dinero_fin FROM empleados where fechaingreso <=  fechaIni;--TO_DATE(fechaIni,'DD-MM-YYYY');
    DBMS_OUTPUT.PUT_LINE('Resultado esperado para la PRUEBA1 '+dinero_fin);
    DBMS_OUTPUT.PUT_LINE('-- ');
    IF dinero_ini !=  dinero_fin THEN
        DBMS_OUTPUT.PUT_LINE('ERROR: LA SUMA DE SUELDOS INFERIORES A LA FECHA NO COINCIDE CON EL RESULTADO CORRECTO.');
        v_numAvisos := v_numAvisos + 1;
    END IF;
    IF v_numAvisos = 0 THEN
        DBMS_OUTPUT.PUT_LINE('-- Las comprobaciones de prueba son correctas, pero comprueba que la salida ');
        DBMS_OUTPUT.PUT_LINE('-- por consola sea idéntica a la esperada para confirmar que el resultado');
        DBMS_OUTPUT.PUT_LINE('-- final es correcto.');
    END IF;
    SYS.write_log('PROC_alumno.log');
    EXCEPTION WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('ERROR: SE HA PRODUCIDO UNA EXCEPCION NO CAPTURADA: ' || SQLCODE || ' - ' || SQLERRM);   
        SYS.write_log('PROC_alumno.log');
end;
