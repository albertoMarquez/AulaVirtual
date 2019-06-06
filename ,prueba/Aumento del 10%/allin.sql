select * from all_tables where TABLE_NAME= 'EMPLEADOS';

drop table empleados;

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

 create or replace procedure pa_empleados_aumentarsueldo
 as
 begin
  update empleados set sueldo=sueldo+(sueldo*10/100);
 end;
 
 
 create or replace procedure pa_empleados_aumentarsueldo
 as
 dinero_fin number;
 begin
  update empleados set sueldo=sueldo+(sueldo*10/100);
    SELECT SUM(sueldo) INTO dinero_fin FROM empleados ;
  DBMS_OUTPUT.PUT_LINE('Dinero total :');
  DBMS_OUTPUT.PUT_LINE(dinero_fin);
 end;
 
 
  --Cree un procedimiento almacenado llamado "pa_empleados_aumentarsueldo". 
  --Debe incrementar el sueldo de los empleados con cierta cantidad de años en la empresa (parámetro "ayear" de tipo numérico)
  --en un porcentaje (parámetro "aporcentaje" de tipo numerico); es decir, recibe 2 parámetros.
  SET SERVEROUTPUT ON;
DECLARE
        dinero_ini number  := 0;
        dinero_fin number;
        v_numAvisos INTEGER := 0;

    BEGIN
        SELECT SUM(sueldo) INTO dinero_ini FROM empleados ;
        dinero_ini := dinero_ini+(dinero_ini*10/100);
        dbms_output.enable(100000);
        DBMS_OUTPUT.PUT_LINE('-- --------------------------------------------------------------');
        DBMS_OUTPUT.PUT_LINE('-- PRUEBA 1: Ejecucion correcta del procedimiento.');
        DBMS_OUTPUT.PUT_LINE('-- Ejecucion con datos, comprobacion de calculos y de excepciones.');
        DBMS_OUTPUT.PUT_LINE('-- --------------------------------------------------------------');
        DBMS_OUTPUT.PUT_LINE('-- ');
        
        pa_empleados_aumentarsueldo();
        SELECT SUM(sueldo) INTO dinero_fin FROM empleados ;
        DBMS_OUTPUT.PUT_LINE(dinero_ini);
        DBMS_OUTPUT.PUT_LINE(dinero_fin);
        IF dinero_ini !=  dinero_fin THEN
            DBMS_OUTPUT.PUT_LINE('ERROR: EL TOTAL CALCULADO PARA TAQUILLAS NO COINCIDE CON EL TOTAL TICKETS.');
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