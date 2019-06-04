create or replace PROCEDURE write_log(nombreFic VARCHAR2) AS
    l_line VARCHAR2(255);
    l_done NUMBER;
    l_file utl_file.file_type;
BEGIN
    l_file := utl_file.fopen('TMP', nombreFic, 'W');
    LOOP
        EXIT WHEN l_done = 1;
       dbms_output.get_line(l_line, l_done);
       utl_file.put_line(l_file, l_line);
    END LOOP;
    utl_file.fflush(l_file);
    utl_file.fclose(l_file);
END write_log;