-- Migration 4: KIS Sub-strands for all levels (PP1-Grade 9)

-- KIS PP1 Sub-strands
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Kusikiliza Maneno', 
  '["Kusikiliza na kuelewa maneno rahisi", "Kujibu maswali rahisi", "Kufuata maagizo"]'::jsonb,
  '["Tunasikia nini?", "Tunaonyesha vipi tunasikiia?"]'::jsonb,
  '["Nyimbo za watoto", "Mchezo wa kufuata maagizo", "Hadithi fupi"]'::jsonb,
  ARRAY['communication', 'learning_to_learn']::cbc_competency[],
  ARRAY['respect', 'responsibility']::cbc_value[],
  6
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'pp1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 2, 'Kuimba na Kusema Mashairi', 
  '["Kuimba nyimbo rahisi", "Kusema mashairi mafupi", "Kutumia ishara zinazofaa"]'::jsonb,
  '["Tunajua nyimbo zipi?", "Mashairi yanafunza nini?"]'::jsonb,
  '["Kuimba pamoja", "Mashairi ya watoto", "Mchezo wa maneno"]'::jsonb,
  ARRAY['communication', 'creativity']::cbc_competency[],
  ARRAY['love', 'unity']::cbc_value[],
  6
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'pp1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Kutambua Herufi', 
  '["Kutambua herufi za alfabeti", "Kulinganisha herufi kubwa na ndogo", "Kusoma herufi katika mazingira"]'::jsonb,
  '["Herufi hii ni ipi?", "Tunaona herufi wapi?"]'::jsonb,
  '["Kucheza na herufi", "Nyimbo za alfabeti", "Kutafuta herufi"]'::jsonb,
  ARRAY['communication', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'pp1' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Kuandika Mifumo', 
  '["Kuchora mifumo ya awali", "Kushika penseli vizuri", "Kufuata mistari na miviringo"]'::jsonb,
  '["Tunashika penseli vipi?", "Tunachora mifumo gani?"]'::jsonb,
  '["Kuchora mifumo", "Kuandika hewani", "Sanduku la mchanga"]'::jsonb,
  ARRAY['creativity', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  6
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'pp1' AND strand_number = 3;

-- KIS PP2 Sub-strands
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Kusikiliza Hadithi', 
  '["Kusikiliza hadithi fupi", "Kusimulia hadithi", "Kujibu maswali kuhusu hadithi"]'::jsonb,
  '["Hadithi inahusu nini?", "Kilitokea nini katika hadithi?"]'::jsonb,
  '["Kusoma hadithi", "Kusimulia hadithi", "Michezo ya hadithi"]'::jsonb,
  ARRAY['communication', 'creativity']::cbc_competency[],
  ARRAY['love', 'peace']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'pp2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Kusoma Silabi', 
  '["Kutambua silabi", "Kusoma maneno yenye silabi mbili", "Kuchanganya silabi kuunda maneno"]'::jsonb,
  '["Silabi ni nini?", "Tunaunda maneno vipi?"]'::jsonb,
  '["Mchezo wa silabi", "Kusoma pamoja", "Kuunda maneno"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'pp2' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Kuandika Herufi', 
  '["Kuandika herufi zote vizuri", "Kudumisha ukubwa sawa", "Kuweka nafasi vizuri"]'::jsonb,
  '["Tunaunda herufi vipi?", "Kwa nini maandishi mazuri ni muhimu?"]'::jsonb,
  '["Zoezi la herufi", "Maandishi ya mkono", "Mchezo wa herufi"]'::jsonb,
  ARRAY['creativity', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'pp2' AND strand_number = 3;

-- KIS Grade 1-3 Sub-strands
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Mazungumzo ya Kila Siku', 
  '["Kushiriki katika mazungumzo", "Kutumia sentensi kamili", "Kusema kwa uwazi"]'::jsonb,
  '["Tunasema nini?", "Tunaongea vipi na wengine?"]'::jsonb,
  '["Mazungumzo ya darasa", "Kazi ya jozi", "Mchezo wa kuigiza"]'::jsonb,
  ARRAY['communication', 'self_efficacy']::cbc_competency[],
  ARRAY['respect', 'love']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Kusoma kwa Ufasaha', 
  '["Kusoma kwa kasi inayofaa", "Kutumia hali ya sauti", "Kutambua maneno haraka"]'::jsonb,
  '["Wasomaji wazuri wanasikiaje?", "Kwa nini tunasimama kwenye alama?"]'::jsonb,
  '["Kusoma pamoja", "Kusoma kwa sauti", "Kusoma kwa jozi"]'::jsonb,
  ARRAY['communication', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_1' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Kuandika Sentensi', 
  '["Kuandika sentensi kamili", "Kutumia herufi kubwa na nukta", "Kunakili sentensi kwa usahihi"]'::jsonb,
  '["Sentensi kamili ni nini?", "Lini tunatumia herufi kubwa?"]'::jsonb,
  '["Kuunda sentensi", "Imla", "Kunakili"]'::jsonb,
  ARRAY['communication', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_1' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Nomino na Viwakilishi', 
  '["Kutambua nomino", "Kutumia viwakilishi sahihi", "Kuunda wingi wa nomino"]'::jsonb,
  '["Nomino ni nini?", "Tunaunda wingi vipi?"]'::jsonb,
  '["Kutafuta nomino", "Zoezi la viwakilishi", "Mchezo wa wingi"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[],
  6
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_1' AND strand_number = 4;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Kusikiliza kwa Makini', 
  '["Kuonyesha kusikiliza kwa makini", "Kufupisha ujumbe", "Kujibu kwa busara"]'::jsonb,
  '["Tunaonyesha vipi tunasikiia?", "Kwa nini kusikiliza kwa makini ni muhimu?"]'::jsonb,
  '["Michezo ya kusikiliza", "Shughuli za kufupisha", "Kusikiliza kwa jozi"]'::jsonb,
  ARRAY['communication', 'self_efficacy']::cbc_competency[],
  ARRAY['respect', 'responsibility']::cbc_value[],
  6
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Mbinu za Kusoma', 
  '["Kutumia muktadha kwa maneno yasiyojulikana", "Kujirekebisha", "Kusoma maandishi marefu kwa ufasaha"]'::jsonb,
  '["Tunafanya nini tunapoona neno lisilojulikana?", "Tunawezaje kuangalia usomaji wetu?"]'::jsonb,
  '["Zoezi la muktadha", "Kujisimamia", "Kusoma kwa kujitegemea"]'::jsonb,
  ARRAY['critical_thinking', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_2' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Kuandika Aya', 
  '["Kuandika sentensi zinazohusiana kuhusu mada", "Kutumia sentensi ya mwanzo", "Kupanga mawazo kimantiki"]'::jsonb,
  '["Aya ni nini?", "Tunapangaje maandishi yetu?"]'::jsonb,
  '["Kuunda aya", "Vielezo vya picha", "Ukuzaji wa mada"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_2' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Vitenzi na Nyakati', 
  '["Kutambua vitenzi katika sentensi", "Kutumia wakati uliopo na uliopita", "Kulinganisha kiima na kitenzi"]'::jsonb,
  '["Kitenzi ni nini?", "Tunaonyesha vipi mambo yanapotokea?"]'::jsonb,
  '["Kutambua vitenzi", "Zoezi la nyakati", "Makubaliano ya kiima-kitenzi"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_2' AND strand_number = 4;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Majadiliano na Midahalo', 
  '["Kushiriki katika majadiliano ya kikundi", "Kueleza na kutetea maoni", "Kusikiliza maoni tofauti"]'::jsonb,
  '["Tunashiriki vipi mawazo tofauti?", "Kwa nini ni muhimu kusikiliza wengine?"]'::jsonb,
  '["Majadiliano ya kikundi", "Midahalo rahisi", "Kushiriki maoni"]'::jsonb,
  ARRAY['communication', 'citizenship']::cbc_competency[],
  ARRAY['respect', 'peace']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_3' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Ufahamu wa Makisio', 
  '["Kufanya makisio kutoka maandishi", "Kutoa hitimisho", "Kutambua kusudi la mwandishi"]'::jsonb,
  '["Mwandishi anamaanisha nini?", "Kwa nini mwandishi aliandika hivi?"]'::jsonb,
  '["Zoezi la makisio", "Mjadala wa kusudi la mwandishi", "Uchambuzi wa maandishi"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_3' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Uandishi wa Ubunifu', 
  '["Kuandika hadithi fupi", "Kutumia lugha ya maelezo", "Kuunda hadithi za kubuni"]'::jsonb,
  '["Tunafanyaje maandishi yetu kuvutia?", "Hadithi nzuri ina nini?"]'::jsonb,
  '["Uandishi wa hadithi", "Zoezi la maelezo", "Mazoezi ya ubunifu"]'::jsonb,
  ARRAY['creativity', 'communication']::cbc_competency[],
  ARRAY['love', 'peace']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_3' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Vivumishi na Vielezi', 
  '["Kutumia vivumishi kuelezea nomino", "Kutumia vielezi kuelezea vitenzi", "Kulinganisha kwa kutumia vivumishi"]'::jsonb,
  '["Tunaelezea vitu vipi?", "Tunafanyaje maelezo kuvutia zaidi?"]'::jsonb,
  '["Michezo ya maelezo", "Shughuli za vielezi", "Zoezi la kulinganisha"]'::jsonb,
  ARRAY['communication', 'creativity']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_3' AND strand_number = 4;

-- KIS Grade 4-9 Sub-strands
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Mazungumzo Rasmi', 
  '["Kutumia lugha rasmi", "Kushiriki katika mazungumzo ya kitaaluma", "Kuwasilisha hoja kwa ushahidi"]'::jsonb,
  '["Tunazungumza vipi katika hali rasmi?", "Tunaunga mkono mawazo yetu vipi?"]'::jsonb,
  '["Mazungumzo rasmi", "Uwasilishaji", "Zoezi la ushahidi"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['respect', 'integrity']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_4' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Uchambuzi wa Fasihi', 
  '["Kuchambua wahusika na mandhari", "Kutambua maudhui katika fasihi", "Kulinganisha kazi za fasihi"]'::jsonb,
  '["Nini kinafanya mhusika kuvutia?", "Mwandishi anawasilisha ujumbe gani?"]'::jsonb,
  '["Uchambuzi wa wahusika", "Utambuzi wa maudhui", "Kulinganisha fasihi"]'::jsonb,
  ARRAY['critical_thinking', 'creativity']::cbc_competency[],
  ARRAY['love', 'respect']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_4' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Uandishi wa Insha', 
  '["Kuandika insha zenye muundo", "Kutumia utangulizi, mwili, hitimisho", "Kuunga mkono mawazo kwa mifano"]'::jsonb,
  '["Muundo wa insha ni upi?", "Tunakuzaje hoja?"]'::jsonb,
  '["Zoezi la insha", "Uchambuzi wa muundo", "Ukuzaji wa mifano"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[],
  12
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_4' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Sentensi Changamano', 
  '["Kutumia sentensi za kiunganishi", "Kutumia sentensi changamano", "Kutumia alama za uakifishaji sahihi"]'::jsonb,
  '["Tunaunganisha mawazo vipi?", "Tofauti kati ya sentensi za kiunganishi na changamano ni ipi?"]'::jsonb,
  '["Kuunganisha sentensi", "Zoezi la viunganishi", "Mazoezi ya uakifishaji"]'::jsonb,
  ARRAY['communication', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_4' AND strand_number = 4;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Hotuba za Kushawishi', 
  '["Kuunda hoja za kushawishi", "Kutumia mbinu za balagha", "Kujibu hoja pinzani"]'::jsonb,
  '["Tunashawishi wengine vipi?", "Nini kinafanya hoja kuwa na nguvu?"]'::jsonb,
  '["Zoezi la midahalo", "Hotuba za kushawishi", "Uchambuzi wa hoja"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['integrity', 'peace']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_5' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Usomaji wa Kina', 
  '["Kutathmini vyanzo", "Kutambua upendeleo wa mwandishi", "Kuchanganya habari kutoka vyanzo vingi"]'::jsonb,
  '["Tunatathimini vipi tunachosoma?", "Tunachanganya habari vipi kutoka vyanzo tofauti?"]'::jsonb,
  '["Tathmini ya vyanzo", "Utambuzi wa upendeleo", "Uchanganyaji wa maandishi mengi"]'::jsonb,
  ARRAY['critical_thinking', 'digital_literacy']::cbc_competency[],
  ARRAY['integrity', 'responsibility']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_5' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Uandishi wa Utafiti', 
  '["Kufanya utafiti wa msingi", "Kutaja vyanzo ipasavyo", "Kuandika ripoti za utafiti"]'::jsonb,
  '["Tunapata habari sahihi vipi?", "Kwa nini tunataja vyanzo?"]'::jsonb,
  '["Miradi ya utafiti", "Zoezi la kutaja", "Uandishi wa ripoti"]'::jsonb,
  ARRAY['communication', 'digital_literacy']::cbc_competency[],
  ARRAY['integrity', 'responsibility']::cbc_value[],
  12
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_5' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Sarufi ya Juu', 
  '["Kutumia kauli ya kutendwa", "Kudumisha uthabiti wa nyakati", "Kutumia sentensi za sharti"]'::jsonb,
  '["Lini tunatumia kauli ya kutendwa?", "Tunadumisha uthabiti vipi katika maandishi?"]'::jsonb,
  '["Mazoezi ya sarufi", "Zoezi la kuhariri", "Uchambuzi wa mtindo"]'::jsonb,
  ARRAY['communication', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_5' AND strand_number = 4;

-- Continue for Grade 6-9 (similar pattern)
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Mazungumzo ya Kitaaluma', 
  '["Kushiriki katika majadiliano ya kitaaluma", "Kutumia lugha rasmi", "Kuunga mkono madai kwa ushahidi"]'::jsonb,
  '["Tunawasiliana vipi katika mazingira ya kitaaluma?", "Lugha ya kitaaluma ni ipi?"]'::jsonb,
  '["Majadiliano ya kitaaluma", "Uwasilishaji rasmi", "Mazungumzo ya ushahidi"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['respect', 'integrity']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_6' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Uthamini wa Fasihi', 
  '["Kuchambua mbinu za kifasihi", "Kutafsiri mashairi na nathari", "Kutathmini thamani ya kifasihi"]'::jsonb,
  '["Mwandishi anatumia mbinu gani za kifasihi?", "Fasihi inaakisi vipi jamii?"]'::jsonb,
  '["Uchambuzi wa mashairi", "Ufasiri wa nathari", "Uhakiki wa kifasihi"]'::jsonb,
  ARRAY['creativity', 'critical_thinking']::cbc_competency[],
  ARRAY['love', 'respect']::cbc_value[],
  12
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_6' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Uandishi wa Maelezo', 
  '["Kuandika maandishi ya maelezo", "Kueleza mawazo changamano kwa uwazi", "Kutumia muundo sahihi wa maandishi"]'::jsonb,
  '["Tunaeleza mawazo changamano vipi?", "Nini kinafanya maandishi kuwa wazi na ya habari?"]'::jsonb,
  '["Insha za maelezo", "Uandishi wa mchakato", "Mazoezi ya uwazi"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_6' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Ujuzi wa Vyombo vya Habari', 
  '["Kuchambua ujumbe wa vyombo vya habari", "Kutambua mbinu za propaganda", "Kuunda maudhui ya vyombo vya habari"]'::jsonb,
  '["Vyombo vya habari vinatuathiri vipi?", "Tunaundaje vyombo vya habari vya kuwajibika?"]'::jsonb,
  '["Uchambuzi wa vyombo vya habari", "Uhakiki wa matangazo", "Uundaji wa vyombo vya habari"]'::jsonb,
  ARRAY['critical_thinking', 'digital_literacy']::cbc_competency[],
  ARRAY['integrity', 'responsibility']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_7' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Fasihi ya Kulinganisha', 
  '["Kulinganisha maandishi katika tanzu", "Kuchambua muktadha wa kitamaduni", "Kutathmini vuguvugu za kifasihi"]'::jsonb,
  '["Maandishi tofauti yanashughulikia vipi maudhui sawa?", "Utamaduni unaathiri vipi fasihi?"]'::jsonb,
  '["Kulinganisha maandishi", "Uchambuzi wa kitamaduni", "Utafiti wa vuguvugu"]'::jsonb,
  ARRAY['critical_thinking', 'citizenship']::cbc_competency[],
  ARRAY['respect', 'love']::cbc_value[],
  12
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_7' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Uandishi wa Hoja', 
  '["Kuunda hoja za kimantiki", "Kushughulikia hoja pinzani", "Kutumia mbinu za kushawishi"]'::jsonb,
  '["Tunajenga hoja zenye nguvu vipi?", "Tunashughulikia vipi maoni tofauti?"]'::jsonb,
  '["Uundaji wa hoja", "Zoezi la hoja pinzani", "Insha za kushawishi"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['integrity', 'peace']::cbc_value[],
  12
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_7' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Usanisi na Tathmini', 
  '["Kusanisi mitazamo mingi", "Kutathmini hoja changamano", "Kuunda maamuzi yenye mantiki"]'::jsonb,
  '["Tunachanganya vipi maoni tofauti?", "Tunatathimini vipi masuala changamano?"]'::jsonb,
  '["Shughuli za usanisi", "Mazoezi ya tathmini", "Maamuzi ya kimantiki"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['integrity', 'responsibility']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_8' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Fasihi ya Dunia', 
  '["Kusoma fasihi kutoka tamaduni tofauti", "Kuchambua maudhui ya ulimwengu", "Kuthamini mitazamo mbalimbali"]'::jsonb,
  '["Maudhui gani ni ya ulimwengu katika tamaduni?", "Fasihi inatuunganisha vipi kimataifa?"]'::jsonb,
  '["Utafiti wa fasihi ya dunia", "Uchambuzi wa maudhui", "Kuthamini kitamaduni"]'::jsonb,
  ARRAY['citizenship', 'creativity']::cbc_competency[],
  ARRAY['respect', 'unity']::cbc_value[],
  12
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_8' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Uandishi wa Kitaaluma', 
  '["Kuandika karatasi rasmi za kitaaluma", "Kutumia mbinu za utafiti", "Kudumisha uadilifu wa kitaaluma"]'::jsonb,
  '["Viwango vya uandishi wa kitaaluma ni vipi?", "Tunadumisha vipi uadilifu katika utafiti?"]'::jsonb,
  '["Karatasi za utafiti", "Zoezi la kutaja", "Viwango vya kitaaluma"]'::jsonb,
  ARRAY['communication', 'learning_to_learn']::cbc_competency[],
  ARRAY['integrity', 'responsibility']::cbc_value[],
  12
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_8' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Lugha na Jamii', 
  '["Kuelewa tofauti za lahaja", "Kuchambua mabadiliko ya lugha", "Kuthamini utofauti wa lugha"]'::jsonb,
  '["Lugha inabadilika vipi?", "Utamaduni unaathiri vipi lugha?"]'::jsonb,
  '["Utafiti wa lahaja", "Historia ya lugha", "Utofauti wa kitamaduni"]'::jsonb,
  ARRAY['communication', 'citizenship']::cbc_competency[],
  ARRAY['respect', 'unity']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_9' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Fasihi ya Kisasa', 
  '["Kusoma na kuchambua fasihi ya kisasa", "Kuelewa maudhui ya kisasa", "Kutathmini mitindo ya uandishi ya kisasa"]'::jsonb,
  '["Fasihi ya kisasa inashughulikia masuala gani?", "Mitindo ya uandishi imebadilika vipi?"]'::jsonb,
  '["Kusoma riwaya za kisasa", "Uchambuzi wa maudhui", "Ulinganisho wa mitindo"]'::jsonb,
  ARRAY['critical_thinking', 'creativity']::cbc_competency[],
  ARRAY['love', 'respect']::cbc_value[],
  12
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_9' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Uandishi wa Ubunifu wa Juu', 
  '["Kuandika kazi za ubunifu za hali ya juu", "Kutumia mbinu za kifasihi", "Kukuza mtindo wa kipekee"]'::jsonb,
  '["Tunakuzaje ubunifu wetu?", "Nini kinafanya mtindo wa uandishi kuwa wa kipekee?"]'::jsonb,
  '["Warsha za uandishi", "Ukuzaji wa mtindo", "Mazoezi ya ubunifu"]'::jsonb,
  ARRAY['creativity', 'self_efficacy']::cbc_competency[],
  ARRAY['love', 'peace']::cbc_value[],
  12
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_9' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Sarufi ya Kina', 
  '["Kuelewa muundo wa sentensi changamano", "Kutumia miundo ya kisarufi ya juu", "Kuhariri kwa usahihi wa kisarufi"]'::jsonb,
  '["Muundo wa sentensi changamano ni upi?", "Tunaboreshaje usahihi wa kisarufi?"]'::jsonb,
  '["Uchambuzi wa muundo", "Mazoezi ya sarufi ya juu", "Warsha za kuhariri"]'::jsonb,
  ARRAY['communication', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_9' AND strand_number = 4;