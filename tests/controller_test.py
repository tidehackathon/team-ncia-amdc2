import psycopg2
import psycopg2.extras
import os

dbcon = psycopg2.connect(host=os.environ['DB_HOST'],
                       database='hackathon_dev',
                      user=os.environ['DB_USER'],
                     password=os.environ['DB_PASS'])


def fetch_rows(view_name):
    cursor = dbcon.cursor(cursor_factory = psycopg2.extras.RealDictCursor)
    cursor.execute(f'SELECT * FROM public."{view_name}"')
    return cursor.fetchall()

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
                    domain_row["cap_percent_float"] = (domain_row["capability_count"]/national_exercise_sum)*100
                    domain_row["cap_percent_decimal_part"] = domain_row["cap_percent_float"] % 1
                    domain_row["capability_percent"] = int((domain_row["capability_count"]/national_exercise_sum)*100)
                
                national_exercise_rows_sorted = sorted(national_exercise_rows, key=lambda row: row["cap_percent_decimal_part"], reverse=True)
                
                current_percent = sum([domain["capability_percent"] for domain in national_exercise_rows_sorted])
                missing_percent = 100 - current_percent
                print(f"nation/exercise: {nation}/{exercise} - {current_percent}({missing_percent})")
                for domain_row in national_exercise_rows_sorted:
                    if missing_percent > 0:
                        domain_row["capability_percent"] += 1
                        missing_percent -= 1
                    return_list.append(domain_row)
    return return_list


# test
rows = getCCPercentperNationperExerciseperOpDom()
# get all nations, they are a key
nations_list = set([row["nation_id"] for row in rows])
# get all exercise, this is another key
exercises = set([row["exercise_id"] for row in rows])

for exercise in exercises:
    for nation in nations_list:
        # find all rows which are in the same nation and exercise
        national_exercise_rows = [row for row in rows if row["nation_id"] == nation and row["exercise_id"] == exercise]
        percents = [domain['capability_percent'] for domain in national_exercise_rows]
        print(f"nation/exercise: {nation}/{exercise} - {sum(percents)}({percents})")