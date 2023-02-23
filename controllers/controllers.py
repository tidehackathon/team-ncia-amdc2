from __main__ import app, dbcon
import psycopg2.extras

from random import randrange

@app.route("/list", methods=['GET'])
def getList():
    print('serving list')
    return [
        {
            'id': 1,
            'name': 'some object 1',
            'value': 10
        },
        {
            'id': 2,
            'name': 'some object 2',
            'value': 5
        },
        {
            'id': 3,
            'name': 'some object 3',
            'value': 16
        },
        {
            'id': 4,
            'name': 'another object 5',
            'value': 4
        },
        {
            'id': 5,
            'name': 'yet another object',
            'value': 22
        },
    ]

# nation-related filters
@app.route('/cc_nation', methods=['GET'])
def getCCperNation():
    cursor = dbcon.cursor(cursor_factory = psycopg2.extras.RealDictCursor)
    cursor.execute('SELECT * FROM public."V_001_CapabilityConfiguration_Nation"')
    return cursor.fetchall()

# nation_id, nation_name, exercise_id, exercise_name, capability_id, capability_name, operation_domain_name, operational_domain_id
@app.route('/nation_operationaldomain_capability_exercise', methods=['GET'])
def getCapabilityperNationperExerciseperOpDom():
    cursor = dbcon.cursor(cursor_factory = psycopg2.extras.RealDictCursor)
    cursor.execute('SELECT * FROM public."V_009_Nation_OpDom_Capability_Exercise"')
    return cursor.fetchall()

# id, name, nation_id, maturity
@app.route('/capabilities')
def getCapabilities():
    cursor = dbcon.cursor(cursor_factory = psycopg2.extras.RealDictCursor)
    cursor.execute('SELECT * FROM public.capabilities')
    return cursor.fetchall()

# nation_id, nation_name, exercise_cycle, exercise_id, capability_count
@app.route('/cc_count_nation_exercise', methods=['GET'])
def getCCCountperNationperExercise():
    cursor = dbcon.cursor(cursor_factory = psycopg2.extras.RealDictCursor)
    cursor.execute('SELECT * FROM public."V_002_002_CapabilityCount_Nation_Exercise"')
    return cursor.fetchall()

# nation_id, nation_name, exercise_id, exercise_cycle, operational_domain_id, operational_domain_name, capability_count
@app.route('/cc_count_exercise_nation_operationdomain', methods=['GET'])
def getCCCountperNationperExerciseperOpDom():
    cursor = dbcon.cursor(cursor_factory = psycopg2.extras.RealDictCursor)
    cursor.execute('SELECT * FROM public."V_006_002_Exercise_Nation_OpDom_CountCapability"')
    return cursor.fetchall()

# nation_id, nation_name, exercise_id, exercise_cycle, operational_domain_id, operational_domain_name, capability_count, capability_percent
@app.route('/cc_percent_exercise_nation_operationdomain', methods=['GET'])
def getCCPercentperNationperExerciseperOpDom():
    cursor = dbcon.cursor(cursor_factory = psycopg2.extras.RealDictCursor)
    cursor.execute('SELECT * FROM public."V_006_002_Exercise_Nation_OpDom_CountCapability"')
    rows = cursor.fetchall()

    # this will be returned
    return_list = []

    # get all nations, they are a key
    nations_list = set([row["nation_id"] for row in rows])
    # get all exercise, this is another key
    exercises = set([row["exercise_id"] for row in rows])

    for nation in nations_list:
        for exercise in exercises:

            # find all rows which are in the same nation and exercise
            national_exercise_rows = [row for row in rows if row["nation_id"] == nation and row["exercise_id"] == exercise]
            # calculate the sum of all capabilities over all domain deployed by the nation in the exercise
            national_exercise_sum = sum([int(domain_row["capability_count"]) for domain_row in national_exercise_rows])
            for domain_row in national_exercise_rows:
                # do the math... 
                domain_row["capability_percent"] = int((domain_row["capability_count"]/national_exercise_sum)*100)
                return_list.append(domain_row)
    return return_list

# exercise_id, exercise_cycle, operational_domain_id, operational_domain_name, capability_count
@app.route('/cc_count_exercise_operationaldomain', methods=['GET'])
def getCCCountperExerciseperOpDom():
    cursor = dbcon.cursor(cursor_factory = psycopg2.extras.RealDictCursor)
    cursor.execute('SELECT * FROM "V_007_002_Exercise_OpDom_CountCapability"')
    return cursor.fetchall()

# exercise_id, exercise_cycle, operational_domain_id, operational_domain_name, capability_count, capability_percent
@app.route('/cc_percent_exercise_operationaldomain', methods=['GET'])
def getCCPercentperExerciseperOpDom():
    rows = getCCCountperExerciseperOpDom()
    return_list = []
    exercises = set([row["exercise_id"] for row in rows])
    for exercise in exercises:
        exercise_rows = [row for row in rows if row["exercise_id"] == exercise]
        exercise_sum = sum([int(domain_row["capability_count"]) for domain_row in exercise_rows])
        for domain_row in exercise_rows:
            domain_row["capability_percent"] = int((domain_row["capability_count"]/exercise_sum)*100)
            return_list.append(domain_row)
    return return_list
            

@app.route('/exercises', methods=['GET'])
def getExercises():
    cursor = dbcon.cursor(cursor_factory = psycopg2.extras.RealDictCursor)
    cursor.execute('SELECT * FROM public.exercises ORDER BY "order" ')
    rows = cursor.fetchall()
    for item in rows:
        item['enabled'] = 'true'
    return rows

@app.route('/nations', methods=['GET'])
def getNations():
    cursor = dbcon.cursor(cursor_factory = psycopg2.extras.RealDictCursor)
    cursor.execute('SELECT * FROM public.nations')
    rows = cursor.fetchall()
    for item in rows:
        item['enabled'] = 'true'
    return rows

@app.route('/nation_exercise_maturecapability_result_count', methods=['GET'])
def getNationExerciseMatureCapabilityResultCount():
    cursor = dbcon.cursor(cursor_factory = psycopg2.extras.RealDictCursor)
    cursor.execute('SELECT * FROM public."V_010_010_Nation_Exercise_Capability_Results"')
    return cursor.fetchall()

@app.route('/nation_exercise_maturecapability_result_percent', methods=['GET'])
def getNationExerciseResultMatureCapabilityPercent():
    rows = getNationExerciseMatureCapabilityResultCount()
    for row in rows:
        cap_tests_sum = row["success_count"] + row["fail_count"]
        row["success_percent"] = int((row["success_count"]/cap_tests_sum)*100)
        row["fail_percent"] = int((row["fail_count"]/cap_tests_sum)*100)
    return rows

@app.route('/nation_exercise_mature_result_count', methods=['GET'])
def getNationMatureExerciseResultCount():
    cursor = dbcon.cursor(cursor_factory = psycopg2.extras.RealDictCursor)
    cursor.execute('SELECT * FROM public."V_010_011_Nation_Exercise_ResultCount"')
    return cursor.fetchall()

@app.route('/nation_exercise_mature_result_percent', methods=['GET'])
def getNationMatureExerciseResultPercent():
    cursor = dbcon.cursor(cursor_factory = psycopg2.extras.RealDictCursor)
    cursor.execute('SELECT * FROM public."V_010_012_Nation_Exercise_ResultPercent"')
    return cursor.fetchall()

@app.route('/nation_exercise_focusarea_capability_result_count', methods=['GET'])
def getNationExerciseFocusAreaCapabilityResultCount():
    cursor = dbcon.cursor(cursor_factory = psycopg2.extras.RealDictCursor)
    cursor.execute('SELECT * FROM public."V_010_022_AllParticipants_FocusArea_ResultCount_Named"')
    return cursor.fetchall()

@app.route('/nation_exercise_focusarea_capability_result_percent', methods=['GET'])
def getNationExerciseFocusAreaCapabilityResultPercent():
    rows = getNationExerciseFocusAreaCapabilityResultCount()
    for row in rows:
        cap_tests_sum = row["success_count"] + row["fail_count"]
        row["success_percent"] = int((row["success_count"]/cap_tests_sum)*100)
        row["fail_percent"] = int((row["fail_count"]/cap_tests_sum)*100)
    return rows

@app.route('/nation_exercise_focusarea_capability_count', methods=['GET'])
def getNationExerciseFocusAreaCapabilityCount():
    cursor = dbcon.cursor(cursor_factory = psycopg2.extras.RealDictCursor)
    cursor.execute('SELECT * FROM "V_011_002_Nation_Exercise_Capability_FocusAreaCount"')
    return cursor.fetchall()

@app.route('/nation_exercise_focusarea_capability_percent', methods=['GET'])
def getNationExerciseFocusAreaCapabilityPercent():
    rows = getNationExerciseFocusAreaCapabilityCount()
    for row in rows:
        cap_tests_sum = row["success_count"] + row["fail_count"]
        row["success_percent"] = int((row["success_count"]/cap_tests_sum)*100)
        row["fail_percent"] = int((row["fail_count"]/cap_tests_sum)*100)
    return rows

@app.route('/nation_exercise_result_count', methods=['GET'])
def getNationExerciseResultCount():
    cursor = dbcon.cursor(cursor_factory = psycopg2.extras.RealDictCursor)
    cursor.execute('SELECT * FROM public."V_010_015_AllParticipants_Participant_ResultCount"')
    return cursor.fetchall()

@app.route('/nation_exercise_result_percent', methods=['GET'])
def getNationExerciseResultPercent():
    rows = getNationExerciseResultCount()
    for row in rows:
        cap_tests_sum = row["success_count"] + row["fail_count"]
        row["success_percent"] = int((row["success_count"]/cap_tests_sum)*100)
        row["fail_percent"] = int((row["fail_count"]/cap_tests_sum)*100)
    return rows

# nation_id, nation_name, exercise_id, exercise_name, capability_id, capability_name, success_percent, fail_percent, partners_tested_percent, io_score_raw, io_score_normalised
@app.route('/nation_exercise_capability_ioscore', methods=['GET'])
def getCapabilityIOScore():
    cursor = dbcon.cursor(cursor_factory = psycopg2.extras.RealDictCursor)
    cursor.execute('SELECT * FROM public."V_011_007_IOScoreMetrics"')
    rows = cursor.fetchall()
    for row in rows:
        cap_tests_sum = row["success_count"] + row["fail_count"]
        row["success_percent"] = int((row["success_count"]/cap_tests_sum)*100)
        row["fail_percent"] = int((row["fail_count"]/cap_tests_sum)*100)
        row["partners_tested_percent"] = int((row["test_partner_count"]/row["potential_partner_count"])*100)
        row["io_score_raw"] = row["partners_tested_percent"] * row["success_percent"]
        row["io_score_normalised"] = round(row["io_score_raw"]/1000, 1)
    return rows
    


