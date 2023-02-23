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


def fetch_rows(view_name):
    cursor = dbcon.cursor(cursor_factory = psycopg2.extras.RealDictCursor)
    cursor.execute(f'SELECT * FROM public."{view_name}"')
    return cursor.fetchall()

# nation-related filters
@app.route('/cc_nation', methods=['GET'])
def getCCperNation():
   return fetch_rows("V_001_CapabilityConfiguration_Nation")

# nation_id, nation_name, exercise_id, exercise_name, capability_id, capability_name, operation_domain_name, operational_domain_id
@app.route('/nation_operationaldomain_capability_exercise', methods=['GET'])
def getCapabilityperNationperExerciseperOpDom():
    return fetch_rows('V_009_Nation_OpDom_Capability_Exercise')

# id, name, nation_id, maturity
@app.route('/capabilities')
def getCapabilities():
    cursor = dbcon.cursor(cursor_factory = psycopg2.extras.RealDictCursor)
    cursor.execute('SELECT * FROM public.capabilities')
    return cursor.fetchall()

# nation_id, nation_name, exercise_cycle, exercise_id, capability_count
@app.route('/cc_count_nation_exercise', methods=['GET'])
def getCCCountperNationperExercise():
    return fetch_rows('V_002_002_CapabilityCount_Nation_Exercise')

# nation_id, nation_name, exercise_id, exercise_cycle, operational_domain_id, operational_domain_name, capability_count
@app.route('/cc_count_exercise_nation_operationdomain', methods=['GET'])
def getCCCountperNationperExerciseperOpDom():
    return fetch_rows('V_006_002_Exercise_Nation_OpDom_CountCapability')

# nation_id, nation_name, exercise_id, exercise_cycle, operational_domain_id, operational_domain_name, capability_count, capability_percent
@app.route('/cc_percent_exercise_nation_operationdomain', methods=['GET'])
def getCCPercentperNationperExerciseperOpDom():
    rows = fetch_rows('V_006_002_Exercise_Nation_OpDom_CountCapability')
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
            if len(national_exercise_rows) > 0:
                # calculate the sum of all capabilities over all domain deployed by the nation in the exercise
                national_exercise_sum = sum([int(domain_row["capability_count"]) for domain_row in national_exercise_rows])
                for domain_row in national_exercise_rows:
                    # do the math... 
                    # this math also sets up for the percentage adjustments
                    domain_row["cap_percent_float"] = (domain_row["capability_count"]/national_exercise_sum)*100
                    domain_row["cap_percent_decimal_part"] = domain_row["cap_percent_float"] % 1
                    domain_row["capability_percent"] = int((domain_row["capability_count"]/national_exercise_sum)*100)
                
                #start correcting percentages
                national_exercise_rows_sorted = sorted(national_exercise_rows, key=lambda row: row["cap_percent_decimal_part"], reverse=True)
                
                current_percent = sum([domain["capability_percent"] for domain in national_exercise_rows_sorted])

                # calculate missing percent
                missing_percent = 100 - current_percent
                for domain_row in national_exercise_rows_sorted:
                    if missing_percent > 0:
                        # while there is still missing percent left, keep adding it
                        domain_row["capability_percent"] += 1
                        missing_percent -= 1
                    return_list.append(domain_row)
    return return_list

# exercise_id, exercise_cycle, operational_domain_id, operational_domain_name, capability_count
@app.route('/cc_count_exercise_operationaldomain', methods=['GET'])
def getCCCountperExerciseperOpDom():
    return fetch_rows('V_007_002_Exercise_OpDom_CountCapability')

# exercise_id, exercise_cycle, operational_domain_id, operational_domain_name, capability_count, capability_percent
@app.route('/cc_percent_exercise_operationaldomain', methods=['GET'])
def getCCPercentperExerciseperOpDom():
    rows = fetch_rows('V_007_002_Exercise_OpDom_CountCapability')
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
    return fetch_rows('V_010_010_Nation_Exercise_Capability_Results')

@app.route('/nation_exercise_maturecapability_result_percent', methods=['GET'])
def getNationExerciseResultMatureCapabilityPercent():
    rows = fetch_rows('V_010_010_Nation_Exercise_Capability_Results')
    for row in rows:
        cap_tests_sum = row["success_count"] + row["fail_count"]
        row["success_percent"] = int((row["success_count"]/cap_tests_sum)*100)
        row["fail_percent"] = int((row["fail_count"]/cap_tests_sum)*100)
    return rows

@app.route('/nation_exercise_mature_result_count', methods=['GET'])
def getNationMatureExerciseResultCount():
    return fetch_rows('V_010_011_Nation_Exercise_ResultCount')

@app.route('/nation_exercise_mature_result_percent', methods=['GET'])
def getNationMatureExerciseResultPercent():
    return fetch_rows('V_010_012_Nation_Exercise_ResultPercent')

@app.route('/nation_exercise_focusarea_capability_result_count', methods=['GET'])
def getNationExerciseFocusAreaCapabilityResultCount():
    return fetch_rows('V_010_022_AllParticipants_FocusArea_ResultCount')

@app.route('/nation_exercise_focusarea_capability_result_percent', methods=['GET'])
def getNationExerciseFocusAreaCapabilityResultPercent():
    rows = fetch_rows('V_010_022_AllParticipants_FocusArea_ResultCount')
    for row in rows:
        if row["assign_count"] == 0:
            row["success_percent"] = 0
            row["fail_percent"] = 0
        else:
            row["success_percent"] = int((row["success_count"]/row["assign_count"])*100)
            row["fail_percent"] = int((row["fail_count"]/row["assign_count"])*100)
    return rows

@app.route('/nation_exercise_focusarea_capability_count', methods=['GET'])
def getNationExerciseFocusAreaCapabilityCount():
    return fetch_rows('V_011_002_Nation_Exercise_Capability_FocusAreaCount')

@app.route('/nation_exercise_focusarea_capability_percent', methods=['GET'])
def getNationExerciseFocusAreaCapabilityPercent():
    rows = fetch_rows('V_011_002_Nation_Exercise_Capability_FocusAreaCount')
    for row in rows:
        cap_tests_sum = row["success_count"] + row["fail_count"]
        row["success_percent"] = int((row["success_count"]/cap_tests_sum)*100)
        row["fail_percent"] = int((row["fail_count"]/cap_tests_sum)*100)
    return rows

@app.route('/nation_exercise_result_count', methods=['GET'])
def getNationExerciseResultCount():
    return fetch_rows('V_010_015_AllParticipants_Participant_ResultCount')

@app.route('/nation_exercise_result_percent', methods=['GET'])
def getNationExerciseResultPercent():
    rows = fetch_rows('V_010_015_AllParticipants_Participant_ResultCount')
    for row in rows:
        cap_tests_sum = row["success_count"] + row["fail_count"]
        row["success_percent"] = int((row["success_count"]/cap_tests_sum)*100)
        row["fail_percent"] = int((row["fail_count"]/cap_tests_sum)*100)
    return rows

# nation_id, nation_name, exercise_id, exercise_name, capability_id, capability_name, profile_id, profile_name, success_count, test_count, success_percent
@app.route('/nation_exercise_capability_ioscore', methods=['GET'])
def getCapabilityIOScore():
    rows = fetch_rows("V_012_012_Exercise_Participant_FMN_ResultCount_Named")
    for row in rows:
        if row["test_count"] == 0:
            row["success_percent"] = 0
        else:
            row["success_percent"] = int(row["success_count"]/row["test_count"]*100)
    return rows

# nation_id, nation_name, exercise_id, exercise_name, operational_domain_id, operational_domain_name, profile_id, profile_name, success_count, test_count, success_percent
@app.route('/nation_exercise_opdom_ioscore', methods=['GET'])
def getNationalOpDomIOScore():
    rows = fetch_rows("V_012_013_OpDom_Nation_Exercise_Profile_ResultCount")
    for row in rows:
        if row["test_count"] == 0:
            row["success_percent"] = 0
        else:
            row["success_percent"] = int(row["success_count"]/row["test_count"]*100)
    return rows

# nation_id, nation_name, exercise_id, exercise_name, profile_id, profile_name, success_count, test_count, success_percent
@app.route('/nation_exercise_ioscore', methods=['GET'])
def getNationalIOScore():
    rows = fetch_rows("V_012_014_Nation_Exercise_Profile_ResultCount")
    for row in rows:
        if row["test_count"] == 0:
            row["success_percent"] = 0
        else:
            row["success_percent"] = int(row["success_count"]/row["test_count"]*100)
    return rows

# exercise_id, profile_id, profile_name, success_count, test_count, success_percent
@app.route('/exercise_ioscore', methods=['GET'])
def getExerciseIOScore():
    rows = fetch_rows("V_012_015_Exercise_Profile_ResultCount")
    for row in rows:
        if row["test_count"] == 0:
            row["success_percent"] = 0
        else:
            row["success_percent"] = int(row["success_count"]/row["test_count"]*100)
    return rows

# nation_id, nation_name, capability_id, capability_name, exercise_id, exercise_name, test_count, success_count, success_percent
@app.route('/nation_exercise_capability_mdoscore', methods=['GET'])
def getCapabilityMDOResultCount():
    rows = fetch_rows("V_005_010_Capability_Exercise_ResultCount_SMD_Named")
    for row in rows:
        if row["test_count"] == 0:
            row["success_percent"] = 0
        else:
            row["success_percent"] = int(row["success_count"]/row["test_count"]*100)
    return rows

# nation_id, nation_name, exercise_id, exercise_name, operational_domain_id, operational_domain_name, test_count, success_count
@app.route('/nation_exercise_opdom_mdoscore', methods=['GET'])
def getNationalExerciseOpDomMDOScore():
    return fetch_rows("V_005_012_Exercise_Nation_OpDom_ResultCount_SMD_Named")

# nation_id, nation_name, exercise_id, exercise_name, test_count, success_count
@app.route('/nation_exercise_mdoscore', methods=['GET'])
def getNationalExerciseMDOScore():
    return fetch_rows("V_005_011_Exercise_Nation_ResultCount_SMD_Named")

# exercise_id, exercise_name, test_count, success_count
@app.route('/exercise_mdoscore', methods=['GET'])
def getExerciseMDOScore():
    return fetch_rows("V_005_013_Exercise_ResultCount_SMD_Named")

# exercise_id, exercise_name, operational_domain_id, operational_domain_name, test_count, success_count
@app.route('/exercise_opdom_mdoscore', methods=['GET'])
def getExerciseOpDomMDOScore():
    return fetch_rows("V_005_014_Exercise_OpDom_ResultCount_SMD_Named")

# exercise_id, exercise_name, operational_domain_id, operational_domain_name, profile_id, profile_name, success_count, test_count, success_percent
@app.route('/exercise_opdom_ioscore', methods=['GET'])
def getExerciseOpDomIOScore():
    rows = fetch_rows("V_012_016_Exercise_OpDom_Profile_ResultCount")
    for row in rows:
        if row["test_count"] == 0:
            row["success_percent"] = 0
        else:
            row["success_percent"] = int(row["success_count"]/row["test_count"]*100)
    return rows

# exercise_id, exercise_name, operational_area_name, operational_area_id, supply_value, supply_name
@app.route('/exercise_ndpp_supply_demand', methods=['GET'])
def getExerciseNDPPValues():
    return fetch_rows("V_013_OperationalArea_Supply_Demand")