
INSERT INTO schule (schulname, kanton) VALUES
('Gymnasium Kirchenfeld', 'BE'),
('Gymnasium Neufeld', 'BE'),
('Gymnasium Lerbermatt', 'BE'),
('Gymnasium Hofwil', 'BE'),
('Gymnasium Biel-Seeland', 'BE'),
('Gymnase de Bienne et du Jura bernois', 'BE'),
('Gymnasium Burgdorf', 'BE'),
('Gymnasium Oberaargau', 'BE'),
('Gymnasium Interlaken', 'BE'),
('Gymnasium Thun', 'BE'),
('Berner Maturitätsschule für Erwachsene (BME)', 'BE'),
('Gymnasium Muristalden', 'BE'),
('Gymnasium NMS Bern', 'BE'),
('Freies Gymnasium Bern', 'BE'),
('Feusi Bildungszentrum AG (Gymnasium / Sportgymnasium)', 'BE'),
('Fachmittelschule Neufeld', 'BE'),
('Fachmittelschule Lerbermatt', 'BE'),
('Fachmittelschule Biel-Seeland', 'BE'),
('Fachmittelschule Oberaargau', 'BE'),
('Fachmittelschule Thun', 'BE'),
('Ecole de culture générale de Bienne et du Jura bernois', 'BE'),
('Fachmittelschule NMS Bern', 'BE');


-- Test data--

INSERT INTO sportlehrperson (name, vorname, email, password_gehashed, schul_id, needs_password_change) VALUES
('Muster', 'Max', 'max.muster@gymnasiumkirchenfeld.ch', 'hashed_password_1', 1, true),
('Schmidt', 'Anna', 'anna.schmidt@gymnasiumhofwil.ch', 'hashed_password_2', 4, true),
('Meier', 'Jonas', 'jonas.meier@gymnasiumneufeld.ch', 'hashed_password_3', 2, true),
('Keller', 'Laura', 'laura.keller@gymnasiumthun.ch', 'hashed_password_4', 10,true);

INSERT INTO sportklasse (name,jahrgang,sportl_id,schul_id) VALUES 
('28b',2009,27,2),
('28a',2009,27,2),
('5ab', 2000,26,4),
('4cd', 2008,26,4);

INSERT INTO challenge (startzeitpunkt, endzeitpunkt, abgeschlossen, challengevl_id, sportl_id) VALUES
('2024-11-09-12:00:00', '2024-11-10-12:00:00', false, 11, 27),
('2024-11-09-12:00:00', '2024-11-10-12:00:00', false, 12, 27),
('2024-11-09-12:00:00', '2024-11-10-12:00:00', false, 13, 26),
('2024-11-09-12:00:00', '2024-11-10-12:00:00', false, 13, 26);

INSERT INTO klassen_challenge_instanz(meter_absolviert, sportkl_id, challenge_id) VALUES
(15000,34,5 ),
(20000,32,5),
(30500,33,6),
