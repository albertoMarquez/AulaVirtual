
--SET SERVEROUTPUT ON;

DECLARE
  v_acceso VARCHAR2(10) := 'Este';
  v_ventasTicketsAntes NUMBER(11,2) := 0;
  v_ventasTicketsDespues NUMBER(11,2) := 0;
  v_ventasTaquillas NUMBER(11,2) := 0;
  v_numAvisos INTEGER := 0;

  -- cursor para recorrer las taquillas de la puerta p_puerta.
  CURSOR c_taquillas IS
  	 SELECT taquilla
	 FROM taquillas
	 WHERE puerta=v_acceso;
BEGIN
  dbms_output.enable(100000);
  DBMS_OUTPUT.PUT_LINE('-- --------------------------------------------------------------');
  DBMS_OUTPUT.PUT_LINE('-- PRUEBA 1: Ejecucion correcta del procedimiento.');
  DBMS_OUTPUT.PUT_LINE('-- Ejecucion con datos, comprobacion de calculos y de excepciones.');
  DBMS_OUTPUT.PUT_LINE('-- --------------------------------------------------------------');
  DBMS_OUTPUT.PUT_LINE('-- ');
  
  UPDATE taquillas SET ventas = 0;
  
  SELECT SUM(precio) INTO v_ventasTicketsAntes
  FROM tickets JOIN taquillas USING (taquilla)
  WHERE puerta = v_acceso;

  ventas_por_puerta('Este');

  SELECT SUM(precio) INTO v_ventasTicketsDespues
  FROM tickets JOIN taquillas USING (taquilla)
  WHERE puerta = v_acceso;

  SELECT SUM(ventas) INTO v_ventasTaquillas
  FROM taquillas WHERE puerta = v_acceso;
  
  IF v_ventasTicketsAntes != v_ventasTicketsDespues THEN
    DBMS_OUTPUT.PUT_LINE('AVISO: SE HA MODIFICADO EL PRECIO DE LOS TICKETS VENDIDOS.');
    v_numAvisos := v_numAvisos + 1;
  END IF;
  IF v_ventasTicketsAntes != v_ventasTaquillas THEN
    DBMS_OUTPUT.PUT_LINE('ERROR: EL TOTAL CALCULADO PARA TAQUILLAS NO COINCIDE CON EL TOTAL TICKETS.');
    v_numAvisos := v_numAvisos + 1;
  END IF;
  IF v_numAvisos = 0 THEN
    DBMS_OUTPUT.PUT_LINE('-- Las comprobaciones de prueba son correctas, pero comprueba que la salida ');
    DBMS_OUTPUT.PUT_LINE('-- por consola sea idéntica a la esperada para confirmar que el resultado');
    DBMS_OUTPUT.PUT_LINE('-- final es correcto.');
  END IF;
  SYS.write_log('PROC_alumno.log');
EXCEPTION
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('ERROR: SE HA PRODUCIDO UNA EXCEPCION NO CAPTURADA: ' || SQLCODE || ' - ' || SQLERRM);   
    SYS.write_log('PROC_alumno.log');
END;