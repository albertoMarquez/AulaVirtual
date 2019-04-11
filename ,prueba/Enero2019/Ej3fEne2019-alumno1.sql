-- -------------------------------------------------------------
-- Bases de Datos.  Examen de enero de 2019. Ejercicio 3f.
-- -------------------------------------------------------------

ALTER SESSION SET nls_date_format='DD/MM/YYYY';

CREATE OR REPLACE PROCEDURE ventas_por_puerta(p_puerta accesos.puerta%TYPE) AS
-- cursor para recorrer las taquillas de la puerta p_puerta.
CURSOR c_taquillas IS
  SELECT taquilla
  FROM taquillas
  WHERE puerta=p_puerta;
 
-- Cursor para recorrer los clientes que han comprado en v_taquilla.
-- Se puede utilizar un parametro en un cursor para proporcionar la
-- taquilla que debe recorrerse, pero nosotros utilizaremos directamente
-- una variable local v_taquilla.
v_taquilla taquillas.taquilla%TYPE;
CURSOR c_clientes IS
  SELECT DNIcliente, SUM(precio) AS importe, COUNT(*) AS tickets
  FROM tickets JOIN taquillas USING (taquilla)
  WHERE taquilla=v_taquilla AND puerta = p_puerta
  GROUP BY DNIcliente;
 
v_existe_puerta INTEGER;
v_taquilla_tickets NUMBER(5,0);
v_taquilla_ventas  NUMBER(7,2);
v_puerta_ventas NUMBER(8,2) := 0;
 
e_sin_venta EXCEPTION;
 
BEGIN
  -- Comprobacion de que la puerta existe en la BD
  -- ERROR: SELECT INTO DEVUELVE VARIAS FILAS
  SELECT 0 INTO v_existe_puerta FROM accesos; -- WHERE puerta=p_puerta;
 
  FOR r_taquilla IN c_taquillas LOOP
    DBMS_OUTPUT.PUT_LINE('Taquilla: ' || r_taquilla.taquilla);
    v_taquilla_tickets := 0;
    v_taquilla_ventas := 0.0;
    v_taquilla := r_taquilla.taquilla;
  
    FOR r_clientes IN c_clientes LOOP
    	DBMS_OUTPUT.PUT_LINE('	DNI: ' || r_clientes.DNIcliente || ', importe: ' ||
            TO_CHAR(r_clientes.importe,'999D99') || ', tickets: ' || r_clientes.tickets);
       	v_taquilla_ventas := v_taquilla_ventas + r_clientes.importe;
       	v_taquilla_tickets := v_taquilla_tickets + r_clientes.tickets;
    END LOOP;
    DBMS_OUTPUT.PUT_LINE('	Total: ' || v_taquilla_ventas || ' eur (' || v_taquilla_tickets || ' tickets)');
    v_puerta_ventas := v_puerta_ventas + v_taquilla_ventas;

    UPDATE taquillas SET ventas=v_taquilla_ventas WHERE taquilla=r_taquilla.taquilla;
  END LOOP;
  IF v_puerta_ventas=0 THEN RAISE e_sin_venta; END IF;
 
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    DBMS_OUTPUT.PUT_LINE('La puerta ' || p_puerta || ' no existe.');
  WHEN e_sin_venta THEN
    DBMS_OUTPUT.PUT_LINE('La puerta ' || p_puerta || ' no tiene entradas vendidas.');
END;
/

