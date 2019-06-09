DECLARE
    dinero number  := 0;
    dinero_ini number  := 0;
    dinero_fin number;
    v_numAvisos INTEGER := 0;
    fechaIni date := '05/05/2000';
BEGIN
    SELECT SUM(sueldo) INTO dinero_ini FROM empleados where fechaingreso <=  fechaIni;
    dinero_ini := dinero_ini+(dinero_ini*10/100);
    dbms_output.enable(100000);
    DBMS_OUTPUT.PUT_LINE('-- --------------------------------------------------------------');
    DBMS_OUTPUT.PUT_LINE('-- PRUEBA 1: Ejecucion correcta del procedimiento.');
    DBMS_OUTPUT.PUT_LINE('-- Ejecucion con datos, comprobacion de calculos y de excepciones.');
    DBMS_OUTPUT.PUT_LINE('-- --------------------------------------------------------------');
    DBMS_OUTPUT.PUT_LINE('-- ');
    aumentarSueldo(fechaIni,10);
    SELECT SUM(sueldo) INTO dinero_fin FROM empleados where fechaingreso <=  fechaIni;
    DBMS_OUTPUT.PUT_LINE('Resultado para la PRUEBA 1: ');
    DBMS_OUTPUT.PUT_LINE(dinero_fin);
    DBMS_OUTPUT.PUT_LINE('-- ');
    IF dinero_ini !=  dinero_fin THEN
        DBMS_OUTPUT.PUT_LINE('ERROR: LA SUMA DE SUELDOS INFERIORES A LA FECHA NO COINCIDE CON EL RESULTADO CORRECTO.');
        v_numAvisos := v_numAvisos + 1;
    END IF;
    IF v_numAvisos = 0 THEN
        DBMS_OUTPUT.PUT_LINE('-- Las comprobaciones de prueba son correctas, pero comprueba que la salida ');
        DBMS_OUTPUT.PUT_LINE('-- por consola sea identica a la esperada para confirmar que el resultado');
        DBMS_OUTPUT.PUT_LINE('-- final es correcto.');
    END IF;
    SYS.write_log('PROC_alumno.log');
    EXCEPTION WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('ERROR: SE HA PRODUCIDO UNA EXCEPCION NO CAPTURADA: ' || SQLCODE || ' - ' || SQLERRM);   
        SYS.write_log('PROC_alumno.log');
end;