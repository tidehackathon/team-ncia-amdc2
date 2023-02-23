import psycopg2
import psycopg2.extras
import os

dbcon = psycopg2.connect(host=os.environ['DB_HOST'],
                       database='hackathon_dev',
                      user=os.environ['DB_USER'],
                     password=os.environ['DB_PASS'])


def getCCPercentperNationperExerciseperOpDom():
    cursor = dbcon.cursor(cursor_factory = psycopg2.extras.RealDictCursor)
    cursor.execute('SELECT * FROM public."V_006_002_Exercise_Nation_OpDom_CountCapability"')
    rows = cursor.fetchall()
    return_list = []
    nations_list = [row["nation_id"] for row in rows]
    print(nations_list)
    exercises = set([row["exercise_id"] for row in rows])
    for nation in nations_list:
        for exercise in exercises:
            national_exercise_rows = [row for row in rows if row["nation_id"] == nation and row["exercise_id"] == exercise]
            national_exercise_sum = sum([int(capability_count["capability_count"]) for capability_count in national_exercise_rows])
            for domain_row in national_exercise_rows:
                domain_row["percent"] = int((domain_row["capability_count"]/national_exercise_sum)*100)
                return_list.append(domain_row)
    return return_list


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
        row["io_score_normalised"] = round(row["IOScoreRaw"]/1000, 1)
    return rows

rows = getCapabilityIOScore()

for row in rows:
    print(row["capability_name"], row["io_score_normalised"])

ioscores = [row["io_score_normalised"] for row in rows]

print(max(ioscores))
print(min(ioscores))