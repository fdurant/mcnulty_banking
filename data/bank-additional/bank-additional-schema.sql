USE bank;
CREATE TABLE bank_full(
       age		INT,
       job   		ENUM('admin.','blue-collar','entrepreneur','housemaid','management','retired','self-employed','services','student','technician','unemployed','unknown'),
       marital		ENUM('divorced','married','single','unknown'),
       education	ENUM('basic.4y','basic.6y','basic.9y','high.school','illiterate','professional.course','university.degree','unknown'),
       bank_def		ENUM('no','yes','unknown'),
       housing		ENUM('no','yes','unknown'),
       loan		ENUM('no','yes','unknown'),
       contact		ENUM('cellular','contact','telephone'),
       contact_month	ENUM('jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'),
       day_of_week	ENUM('mon','tue','wed','thu','fri','sat','sun'),
       duration		INT,
       campaign		INT,
       pdays		INT,
       previous		INT,
       poutcome		ENUM('failure','nonexistent','success'),
       emp_var_rate	FLOAT,
       cons_price_idx	FLOAT,
       cons_conf_idx	FLOAT,
       euribor3m	FLOAT,
       nr_employed	FLOAT,
       y		ENUM('yes','no')
)
