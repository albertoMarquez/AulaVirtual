DECLARE
    dinero number  := 0;
    dinero_ini number  := 0;
    dinero_fin number := 0;
    v_numAvisos INTEGER := 0;
    fechaIni date := '05/05/1900';
BEGIN

    dbms_output.enable(100000);
    DBMS_OUTPUT.PUT_LINE('-- --------------------------------------------------------------');
    DBMS_OUTPUT.PUT_LINE('-- PRUEBA 2: Comprueba que haya empleados para esa fecha');
    DBMS_OUTPUT.PUT_LINE('-- --------------------------------------------------------------');
    DBMS_OUTPUT.PUT_LINE('-- ');

    aumentarSueldo(fechaIni,10);
    DBMS_OUTPUT.PUT_LINE('-- ');
    
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