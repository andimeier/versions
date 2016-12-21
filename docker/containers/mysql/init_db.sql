create table asv (
    id int not null primary key auto_increment,
    projekt varchar(50) not null,
    stunden int
);

insert into asv (projekt,stunden) values ('PROJ1', 123);
insert into asv (projekt,stunden) values ('PROJ2', 223);
insert into asv (projekt,stunden) values ('PROJ2', 005);
insert into asv (projekt,stunden) values ('PROJ2', 008);
insert into asv (projekt,stunden) values ('PROJ1', 017);
insert into asv (projekt,stunden) values ('PROJ1', 136);
insert into asv (projekt,stunden) values ('PROJ2', 035);
insert into asv (projekt,stunden) values ('PROJ1', 074);
