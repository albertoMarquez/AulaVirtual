DECLARE
    resultado varchar2(14);
begin
    dbms_output.enable(100000);
    NoticiasMasVistas(2018);
    resultado := 'resultado.log';
    write_log(resultado);
end;