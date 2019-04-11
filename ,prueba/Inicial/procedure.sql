CREATE OR REPLACE PROCEDURE NoticiasMasVistas(p_anio NUMBER) IS
        v_IdPer ej_periodico.IdPer%TYPE;
        v_numNoticias INTEGER;
      CURSOR cPeriodico IS
        SELECT p.Nombre, p.IdPer FROM ej_periodico p;

      CURSOR cNoticiasMes IS
        SELECT EXTRACT(MONTH FROM n.FechaPub) mes, n.Titular, n.NumVisitas
          FROM ej_noticia n 
          WHERE EXTRACT(YEAR FROM n.FechaPub) = p_anio
          AND n.IdPer = v_IdPer
          AND n.NumVisitas = (SELECT MAX(n2.NumVisitas) 
            FROM ej_noticia n2
            WHERE EXTRACT(YEAR FROM n2.FechaPub) = p_anio
            AND n2.IdPer = n.IdPer
            AND EXTRACT(MONTH FROM n2.FechaPub) =  EXTRACT(MONTH FROM n.FechaPub));
      BEGIN
      DBMS_OUTPUT.PUT_LINE('NOTICIAS MAS VISITADAS ' || p_anio);
      FOR rPeriodico IN cPeriodico LOOP
        DBMS_OUTPUT.PUT_LINE('Perdiodico : ' || rPeriodico.Nombre);
        v_IdPer := rPeriodico.IdPer;
        v_numNoticias := 0;
        FOR rNoticiasMes IN cNoticiasMes LOOP
          v_numNoticias := v_numNoticias + 1;
          DBMS_OUTPUT.PUT_LINE('  Mes: ' || TO_CHAR(rNoticiasMes.mes,'99') ||
            ': ' || RPAD(rNoticiasMes.Titular,70));
          DBMS_OUTPUT.PUT_LINE('            ' || rNoticiasMes.numVisitas || ' Visitas.');
        END LOOP;
          IF v_numNoticias = 0 THEN
          DBMS_OUTPUT.PUT_LINE('  No se han publicado noticias durante 2018');
          END IF;
      END LOOP;
    END;