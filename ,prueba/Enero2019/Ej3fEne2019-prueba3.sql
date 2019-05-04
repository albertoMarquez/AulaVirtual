--SET SERVEROUTPUT ON;

DECLARE
  v_acceso VARCHAR2(10) := 'Oeste';
  v_ventasTaquillasAntes NUMBER(11,2) := 0;
  v_ventasTaquillasDespues NUMBER(11,2) := 0;
  v_numAvisos INTEGER := 0;
BEGIN
  dbms_output.enable(100000);
  DBMS_OUTPUT.PUT_LINE('-- --------------------------------------------------------------');
  DBMS_OUTPUT.PUT_LINE('-- PRUEBA 3: Ejecucion de excepcion del procedimiento.');
  DBMS_OUTPUT.PUT_LINE('-- debe capturar excepcion para indicar que la puerta no tiene');
  DBMS_OUTPUT.PUT_LINE('-- entradas vendidas.');
  DBMS_OUTPUT.PUT_LINE('-- --------------------------------------------------------------');
  
  SELECT SUM(ventas) INTO v_ventasTaquillasAntes
  FROM taquillas WHERE puerta = v_acceso;
  
  ventas_por_puerta(v_acceso);

  SELECT SUM(ventas) INTO v_ventasTaquillasDespues
  FROM taquillas WHERE puerta = v_acceso;
  
  IF v_ventasTaquillasAntes != v_ventasTaquillasDespues THEN
    DBMS_OUTPUT.PUT_LINE('ERROR: SE HAN MODIFICADO DATOS DE VENTAS DE TAQUILLAS.');
    v_numAvisos := v_numAvisos + 1;
  END IF;

  IF v_numAvisos = 0 THEN
    DBMS_OUTPUT.PUT_LINE('-- Las comprobaciones de prueba son correctas, pero comprueba que la salida ');
    DBMS_OUTPUT.PUT_LINE('-- por consola sea identica a la esperada para confirmar que el resultado');
    DBMS_OUTPUT.PUT_LINE('-- final es correcto.');
  END IF;
  SYS.write_log('PROC_alumno.log');
EXCEPTION
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('ERROR: SE HA PRODUCIDO UNA EXCEPCION NO CAPTURADA: ' || SQLCODE || ' - ' || SQLERRM);   
    SYS.write_log('PROC_alumno.log');
END;

