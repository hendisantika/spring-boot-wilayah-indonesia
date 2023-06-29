-- create table hibernate_sequence
-- (
--     next_val bigint null
-- );
--
CREATE SEQUENCE student_id_seq
    MINVALUE 1
    START WITH 1
    INCREMENT BY 50;


CREATE TABLE student
(
    id           bigint       NOT NULL
        PRIMARY KEY,
    email        varchar(255) NULL,
    first_name   varchar(255) NULL,
    last_name    varchar(255) NULL,
    phone_number varchar(255) NULL,
    phone        varchar(255) NOT NULL,
    jurusan      varchar(255) not null,
    birth_date   date         not null,
    provinsi_id  varchar(36)
        CONSTRAINT provinsi_id
            REFERENCES provinsi
            ON UPDATE CASCADE ON DELETE CASCADE,
    kota_id      varchar(36)
        CONSTRAINT kota_id
            REFERENCES kota
            ON UPDATE CASCADE ON DELETE CASCADE,
    kecamatan_id varchar(36)
        CONSTRAINT kecamatan_id
            REFERENCES kota
            ON UPDATE CASCADE ON DELETE CASCADE,
    kelurahan_id varchar(36)
        CONSTRAINT kelurahan_id
            REFERENCES kelurahan
            ON UPDATE CASCADE ON DELETE CASCADE,
    constraint UK_fe0i52si7ybu0wjedj6motiim
        unique (email),
    constraint UK_i3xrfnuv2icsd1vhvn6c108ec
        unique (phone_number)
);


