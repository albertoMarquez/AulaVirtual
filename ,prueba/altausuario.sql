create or replace PROCEDURE ALTA_USUARIO(uid VARCHAR2) AS
        num_alumnos number;
    BEGIN
        SELECT COUNT(*) INTO num_alumnos FROM all_users where USERNAME = uid;--'MARTA1';--;;
        DBMS_OUTPUT.PUT_LINE(uid);
        IF num_alumnos=1 THEN
        --DBMS_OUTPUT.PUT_LINE('marta=='||user_id);
            EXECUTE IMMEDIATE 'DROP USER '||uid||' CASCADE';
        END IF;
        --EXCEPTION WHEN OTHERS THEN IF SQLCODE NOT IN (-1918) THEN RAISE; END IF;
        EXECUTE IMMEDIATE 'CREATE USER '||uid||' IDENTIFIED BY '||uid;
        EXECUTE IMMEDIATE 'GRANT RESOURCE TO '||uid;
        EXECUTE IMMEDIATE 'GRANT CONNECT TO '||uid;
        EXECUTE IMMEDIATE 'GRANT CREATE TRIGGER TO '||uid;
        EXECUTE IMMEDIATE 'GRANT CREATE SEQUENCE TO '||uid;
        EXECUTE IMMEDIATE 'GRANT CREATE TABLE TO '||uid;
        EXECUTE IMMEDIATE 'GRANT CREATE SYNONYM TO '||uid; 
        EXECUTE IMMEDIATE 'GRANT CREATE VIEW TO '||uid;
        EXECUTE IMMEDIATE 'GRANT debug any procedure, debug connect session TO '||uid;
        EXECUTE IMMEDIATE 'GRANT EXECUTE ON sys.write_log TO '||uid;
    END;