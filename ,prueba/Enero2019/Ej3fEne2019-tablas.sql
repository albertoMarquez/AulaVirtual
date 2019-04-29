DROP TABLE tickets;
DROP TABLE atiende;
DROP  TABLE taquillas;
DROP TABLE accesos;
DROP TABLE ofertas;
  
CREATE TABLE ofertas (
  oferta INTEGER PRIMARY KEY,
  desde DATE,
  hasta DATE,
  precio NUMBER(11,2));

CREATE TABLE accesos (
  puerta VARCHAR2(10) PRIMARY KEY,
  capacidad INTEGER);     

CREATE TABLE taquillas (
  taquilla INTEGER PRIMARY KEY,
  puerta REFERENCES accesos,
  ventas NUMBER(11,2));

CREATE TABLE atiende (
  DNIempleado VARCHAR2(10),
  taquilla REFERENCES taquillas,
  desde DATE,
  hasta DATE,
  PRIMARY KEY (DNIempleado, taquilla, desde));

CREATE TABLE tickets (
  ticket INTEGER PRIMARY KEY,
  DNIcliente VARCHAR2(10),
  taquilla REFERENCES taquillas,
  precio NUMBER(11,2),
  fechaCompra DATE
);

INSERT INTO ofertas VALUES (1, '01/12/2018','08/12/2018',11.32);
INSERT INTO ofertas VALUES (2, '25/12/2018','31/12/2018',7.50);

INSERT INTO accesos VALUES ('Oeste', 1);
INSERT INTO accesos VALUES ('Este', 2);
INSERT INTO accesos VALUES ('Sur', 3);
INSERT INTO accesos VALUES ('Norte', 4);

INSERT INTO taquillas VALUES (1101, 'Este', 0.00);
INSERT INTO taquillas VALUES (1102, 'Este', 0.00);
INSERT INTO taquillas VALUES (1201, 'Sur', 0.00);
INSERT INTO taquillas VALUES (1202, 'Sur', 0.00);
INSERT INTO taquillas VALUES (1301, 'Norte', 0.00);

INSERT INTO atiende VALUES ('3701X', 1101, '18/12/2018', '20/12/2018');
INSERT INTO atiende VALUES ('3701X', 1201, '21/12/2018', '24/12/2018');
INSERT INTO atiende VALUES ('3702X', 1101, '21/12/2018', '26/12/2018');
INSERT INTO atiende VALUES ('3702X', 1301, '27/12/2018', '30/12/2018');
INSERT INTO atiende VALUES ('3703X', 1201, '18/12/2018', '20/12/2018');
INSERT INTO atiende VALUES ('3703X', 1301, '21/12/2018', '30/12/2018');

INSERT INTO tickets VALUES (21, '4401Y', 1101, '31/12/2018', 12.00, '20/12/2018');
INSERT INTO tickets VALUES (22, '4402Y', 1102, '31/12/2018',  8.45, '21/12/2018');
INSERT INTO tickets VALUES (23, '4405Y', 1101, '31/12/2018',  9.45, '22/12/2018');
INSERT INTO tickets VALUES (24, '4404Y', 1202, '31/12/2018',  6.25, '23/12/2018');
INSERT INTO tickets VALUES (25, '4405Y', 1301, '31/12/2018', 12.00, '24/12/2018');
INSERT INTO tickets VALUES (26, '4405Y', 1101, '31/12/2018', 12.00, '25/12/2018');
INSERT INTO tickets VALUES (27, '4404Y', 1102, '31/12/2018', 12.00, '26/12/2018');
INSERT INTO tickets VALUES (28, '4406Y', 1201, '31/12/2018', 12.00, '27/12/2018');
INSERT INTO tickets VALUES (29, '4407Y', 1301, '31/12/2018', 12.00, '28/12/2018');

COMMIT;

