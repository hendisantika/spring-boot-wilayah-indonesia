create table student
(
    id           bigint       not null
        primary key,
    email        varchar(255) null,
    first_name   varchar(255) null,
    last_name    varchar(255) null,
    phone_number varchar(255) null,
    phone        varchar(255) not null,
    jurusan      varchar(255) not null,
    birth_date   date         not null,
    constraint UK_fe0i52si7ybu0wjedj6motiim
        unique (email),
    constraint UK_i3xrfnuv2icsd1vhvn6c108ec
        unique (phone_number)
);

