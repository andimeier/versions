-- initialize MySql flint database

create table _data_sets (
	data_set_id int not null auto_increment primary key,
	cdate datetime not null
);

create table _data_sets_data (
	data_set_id int not null,
	table_name varchar(200) not null,
	table_import_key varchar(200) not null
);