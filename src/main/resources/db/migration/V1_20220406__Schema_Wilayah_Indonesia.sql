CREATE TABLE provinsi
(
    id   varchar(36),
    kode varchar(50)  NOT NULL,
    nama varchar(255) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (kode)
);

CREATE TABLE kota
(
    id          varchar(36),
    id_provinsi varchar(36)  NOT NULL,
    kode        varchar(50)  NOT NULL,
    nama        varchar(255) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (kode),
    FOREIGN KEY (id_provinsi) REFERENCES provinsi (id)
);

CREATE TABLE kecamatan
(
    id      varchar(36),
    id_kota varchar(36)  NOT NULL,
    kode    varchar(50)  NOT NULL,
    nama    varchar(255) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (kode),
    FOREIGN KEY (id_kota) REFERENCES kota (id)
);

CREATE TABLE kelurahan
(
    id           varchar(36),
    id_kecamatan varchar(36)  NOT NULL,
    kode         varchar(50)  NOT NULL,
    nama         varchar(255) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (kode),
    FOREIGN KEY (id_kecamatan) REFERENCES kecamatan (id)
);
