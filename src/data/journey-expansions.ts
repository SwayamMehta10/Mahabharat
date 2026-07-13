import type { JourneyChapter } from "@/data/schema";

const j = (parva: number, title: string, text: string, citations: string[]): JourneyChapter => ({
  parva,
  title,
  text: [text],
  citations,
});

/**
 * Journeys for the original atlas characters that previously had biography
 * pages only. Kept separate from the foundational roster so the authored
 * expansion remains reviewable and can share the same runtime schema.
 */
export const journeyExpansions: Record<string, JourneyChapter[]> = {
  shantanu: [
    j(1, "The River's Condition", "Shantanu meets Ganga beside the river and accepts the condition that love will ask no questions. Seven newborn sons are returned to the water before his silence breaks over the eighth, and the woman and child vanish together.", ["Adi Parva §94–98"]),
    j(1, "The Price of a Second Marriage", "Years later he desires Satyavati but cannot pay her father's price without disinheriting Devavrata. His son's terrible vow buys the marriage and leaves the king to grant a blessing that will keep Bhishma alive through the dynasty's ruin.", ["Adi Parva §99–100"]),
  ],
  ganga: [
    j(1, "Seven Returned to the Water", "Ganga takes mortal form to release the Vasus from their curse, marrying Shantanu and carrying seven infants directly from birth into the river while the king keeps his word.", ["Adi Parva §96–98"]),
    j(1, "The Eighth Son Returned", "When Shantanu intervenes, she names the hidden purpose, leaves with Devavrata, and later returns the fully educated prince to his father's court.", ["Adi Parva §98–100"]),
  ],
  satyavati: [
    j(1, "The Ferryman's Daughter", "Before Hastinapura, Satyavati ferries the sage Parashara through river mist and gives birth on an island to Vyasa, who promises to answer whenever she calls.", ["Adi Parva §63"]),
    j(1, "The Dynasty Preserved", "Her marriage to Shantanu costs Bhishma his future. When both of her royal sons die childless, she summons Vyasa and directs the succession that produces Dhritarashtra, Pandu, and Vidura.", ["Adi Parva §100–106"]),
  ],
  vyasa: [
    j(1, "The Island-Born Sage", "Born to Satyavati and Parashara, Krishna Dvaipayana matures into the arranger of the Vedas and the son his mother can summon across any distance.", ["Adi Parva §63"]),
    j(1, "Ancestor and Author", "He fathers the heirs of Vichitravirya, counsels their descendants, grants Sanjaya sight, and finally composes their history for Vaishampayana to recite before Janamejaya.", ["Adi Parva §1", "Adi Parva §105–106"]),
  ],
  dhritarashtra: [
    j(1, "A Crown Seen but Not Given", "Born with the strength of many elephants and without sight, Dhritarashtra watches the throne pass to Pandu and receives it only when his younger brother withdraws to the forest.", ["Adi Parva §106–109"]),
    j(2, "The Silence That Chooses", "Through poison plots, the dice hall, and failed peace, he repeatedly understands Vidura's warning and repeatedly yields to Duryodhana. The war is narrated into his darkness one day at a time.", ["Sabha Parva §58–72", "Udyoga Parva §33–40"]),
    j(15, "The Forest After the Sons", "After years in the victors' palace, he leaves with Gandhari and Kunti, practices austerity, and dies in a forest fire he refuses to flee.", ["Ashramavasika Parva §16–37"]),
  ],
  gandhari: [
    j(1, "The Chosen Blindfold", "Given to a blind prince, Gandhari binds her own eyes and enters the Kuru house under a discipline that becomes both fidelity and distance.", ["Adi Parva §110"]),
    j(9, "Where Dharma Is, Victory Is", "Each morning Duryodhana asks for victory and receives only the truth that victory follows dharma. When all her sons fall, her grief sees the battlefield and turns upon Krishna as a curse.", ["Stri Parva §14–25"]),
    j(15, "The Last Fire", "She withdraws to the forest with Dhritarashtra and Kunti and meets death beside them when the hermitage burns.", ["Ashramavasika Parva §16–37"]),
  ],
  pandu: [
    j(1, "The Conqueror Crowned", "Pandu receives the throne denied to his blind elder brother and extends Kuru power before a hunt changes kingship into exile.", ["Adi Parva §106–112"]),
    j(1, "The Curse in the Forest", "Having killed a mating deer that was a sage in animal form, he is cursed to die in desire. Kunti's mantra and Madri's request bring five divine sons into the forest household.", ["Adi Parva §118–124"]),
    j(1, "The Forbidden Embrace", "Spring overwhelms restraint; Pandu approaches Madri and the curse takes him instantly, leaving two widows and five children to return to Hastinapura.", ["Adi Parva §124–125"]),
  ],
  vidura: [
    j(1, "Wisdom Born Outside the Crown", "Born through Vyasa and a palace maid, Vidura carries Dharma's wisdom but caste bars him from the throne whose dangers he understands most clearly.", ["Adi Parva §106"]),
    j(1, "The Tunnel Beneath the Lac", "He reads the plot at Varanavata, warns Yudhishthira in coded speech, and arranges the hidden passage through which the Pandavas survive the burning house.", ["Adi Parva §143–148"]),
    j(5, "Counsel Refused", "Before war he gives Dhritarashtra a sustained anatomy of just rule and self-mastery. The king praises the medicine and still refuses to take it.", ["Udyoga Parva §33–40"]),
  ],
  madri: [
    j(1, "The Ashvins Answer", "Madri shares Pandu's forest exile and receives Kunti's mantra once, calling the twin Ashvins and bearing Nakula and Sahadeva.", ["Adi Parva §123–124"]),
    j(1, "The Pyre", "When Pandu dies in her embrace, Madri claims responsibility and follows him into the funeral fire, entrusting both twins to Kunti.", ["Adi Parva §124–125"]),
  ],
  yudhishthira: [
    j(1, "The Son of Dharma", "Born through Dharma, Yudhishthira grows into the brother whose claim and restraint both threaten Duryodhana. Indraprastha turns exile into an imperial court.", ["Adi Parva §123", "Sabha Parva §1–45"]),
    j(2, "The Loaded Dice", "He accepts a game he knows is crooked and wagers wealth, kingdom, brothers, himself, and Draupadi. The question of whether a man who has lost himself can still stake another becomes the wound of the age.", ["Sabha Parva §58–72"]),
    j(7, "The Half-Heard Sentence", "To stop Drona's slaughter he says that Ashwatthama is dead and hides the word elephant beneath the conch. His chariot, once held above the earth by truth, touches ground.", ["Drona Parva §191"]),
    j(17, "The Last Companion", "He relinquishes the kingdom and walks north, refusing heaven when it demands abandonment of the dog that followed him. The animal reveals itself as Dharma, his father and final examiner.", ["Mahaprasthanika Parva §1–3", "Svargarohana Parva §1"]),
  ],
  bhima: [
    j(1, "Poison and the River", "Duryodhana poisons Bhima and throws him bound into the Ganga. Serpent venom counters the poison, and the child returns with the strength of a thousand elephants.", ["Adi Parva §128"]),
    j(2, "Vows in the Hall", "When Draupadi is dragged and humiliated, Bhima vows Dushasana's blood and Duryodhana's broken thigh, storing the exact terms for thirteen years.", ["Sabha Parva §68"]),
    j(8, "The Blood Debt", "On the seventeenth day he kills Dushasana and fulfills the terrible vow before both armies.", ["Karna Parva §83"]),
    j(9, "The Thigh", "At the lake he meets Duryodhana in the mace duel and, at Krishna's signal, strikes below the permitted line. Victory and violation arrive in one blow.", ["Shalya Parva §58–61"]),
  ],
  nakula: [
    j(1, "Child of the Ashvins", "Nakula and Sahadeva are born to Madri through the twin gods and enter Hastinapura under Kunti's equal care.", ["Adi Parva §124"]),
    j(3, "Horses of the Exile", "Famed for beauty but defined by disciplined skill, Nakula serves the hidden year as keeper of Virata's horses and restores the royal stables.", ["Virata Parva §12"]),
    j(17, "The Beauty Left Behind", "On the northern road he falls, and Yudhishthira names private pride in beauty as the small imbalance that even a loyal life carried.", ["Mahaprasthanika Parva §2"]),
  ],
  sahadeva: [
    j(1, "The Youngest Twin", "Sahadeva is born through the Ashvins and grows into the quietest Pandava, an observer associated with cattle, omens, and measured counsel.", ["Adi Parva §124"]),
    j(2, "A Vow for the Dice", "After the dice hall he names Shakuni as his own appointed enemy, fixing responsibility not only on the king but on the hand that made deceit into method.", ["Sabha Parva §72"]),
    j(9, "The Board Is Closed", "On the eighteenth day Sahadeva kills Uluka and then Shakuni, announcing that the vow made over the dice has reached its answer.", ["Shalya Parva §28"]),
  ],
  dushasana: [
    j(2, "The Hand in Draupadi's Hair", "Dushasana obeys Duryodhana's command, drags Draupadi into the assembly, and attempts to strip her while the court watches.", ["Sabha Parva §67–68"]),
    j(8, "The Vow Collects Its Price", "Bhima finds him on the seventeenth day, tears open his chest, and enacts the vow in a scene the epic refuses to soften.", ["Karna Parva §83"]),
  ],
  shakuni: [
    j(1, "The Uncle at Court", "Shakuni makes Duryodhana's grievance strategic, turning the unease of succession into plots that can be denied by those who benefit.", ["Adi Parva §110", "Adi Parva §128"]),
    j(2, "The Dice That Obey", "He throws on Duryodhana's behalf and never loses, converting hospitality and royal obligation into the legal machinery of dispossession.", ["Sabha Parva §58–65"]),
    j(9, "The Last Cast", "On the final day his cavalry breaks and Sahadeva takes the death promised in the hall, ending the game at the edge of an emptied field.", ["Shalya Parva §28"]),
  ],
  balarama: [
    j(1, "Teacher of the Mace", "Balarama trains Bhima and Duryodhana in the same discipline, giving both rivals the craft that will decide the war's last royal contest.", ["Adi Parva §221"]),
    j(5, "The Pilgrimage Away from War", "Unable to choose between kin and pupils, he refuses both armies and travels among the sacred fords while Kurukshetra burns.", ["Shalya Parva §34–53"]),
    j(9, "The Blow Below the Waist", "He returns for the final mace duel and nearly attacks Bhima when the forbidden strike breaks Duryodhana's thighs, until Krishna restrains his judgment.", ["Shalya Parva §54–60"]),
  ],
  subhadra: [
    j(1, "The Chariot from Dvaraka", "With Krishna's counsel, Arjuna carries Subhadra away from Dvaraka and the apparent abduction resolves into an accepted marriage.", ["Adi Parva §221–223"]),
    j(7, "Mother After the Wheel", "The thirteenth day returns only the news of Abhimanyu. Subhadra's grief stands beside Draupadi's and Uttara's while Arjuna turns it into a sunset vow.", ["Drona Parva §72–74"]),
    j(14, "Grandmother of the Remnant", "When Parikshit is struck in the womb and restored by Krishna, Subhadra becomes elder of the single surviving branch of her house.", ["Ashvamedhika Parva §68–70"]),
  ],
  drona: [
    j(1, "Milk, Poverty, and a Broken Friendship", "Drona's poverty humiliates his household and sends him to Drupada, whose rejection turns childhood friendship into the purpose behind a royal school.", ["Adi Parva §131–133"]),
    j(1, "The Teacher's Price", "He makes Arjuna his unrivaled pupil, takes Ekalavya's thumb, and uses the Kuru princes to capture Drupada as payment for instruction.", ["Adi Parva §132–139"]),
    j(7, "Commander After Bhishma", "He takes the Kaurava command, builds the chakravyuha, and permits the isolated Abhimanyu to be destroyed by many hands.", ["Drona Parva §7–51"]),
    j(7, "Ashwatthama Is Dead", "Believing his son lost after Yudhishthira's half-truth, Drona lays down his weapons in yoga and is beheaded by the son born to kill him.", ["Drona Parva §190–193"]),
  ],
  kripa: [
    j(1, "Found in the Reeds", "Kripa and Kripi are found as miraculous children of Sharadvan and raised in the Kuru court, where Kripa becomes the princes' first master of arms.", ["Adi Parva §130"]),
    j(10, "One of Three", "He survives the eighteenth day and rides with Ashwatthama and Kritavarma to the sleeping camp, sharing responsibility for the war after the war.", ["Sauptika Parva §1–9"]),
    j(14, "Teacher of the Survivor", "In the emptied kingdom Kripa remains to instruct Parikshit, carrying martial memory into the sole surviving line.", ["Ashvamedhika Parva §70"]),
  ],
  drupada: [
    j(1, "Friendship Divided by a Throne", "As a prince Drupada promises Drona equality; as a king he denies that friendship can cross rank, and is later captured by the pupils of the man he dismissed.", ["Adi Parva §131–139"]),
    j(1, "Children from the Fire", "He performs a sacrifice for the death of Drona and receives Dhrishtadyumna and Draupadi, one born for vengeance and one for a consequence larger than his request.", ["Adi Parva §169"]),
    j(7, "The Teacher's Arrow", "On the fifteenth day Drona kills the old rival whose insult and sacrifice shaped both their lives.", ["Drona Parva §186"]),
  ],
  dhrishtadyumna: [
    j(1, "Born with an Appointment", "Dhrishtadyumna rises armed from the sacrificial fire while a voice announces the death of Drona as his purpose.", ["Adi Parva §169"]),
    j(7, "The Teacher Unarmed", "When Drona lays down his weapons, Dhrishtadyumna ignores Arjuna's cry to take him alive and completes the purpose declared at birth.", ["Drona Parva §193"]),
    j(10, "Denied a Warrior's Death", "Ashwatthama finds him sleeping after victory and kills him without steel, answering a father's death with another violation of martial law.", ["Sauptika Parva §8"]),
  ],
  shikhandi: [
    j(5, "Amba Returned", "Shikhandi carries the unresolved life of Amba into Drupada's house, a rebirth organized around the one warrior who refused her claim.", ["Udyoga Parva §170–193"]),
    j(6, "At the Chariot's Point", "On the tenth day Shikhandi stands before Arjuna. Bhishma recognizes Amba, lowers his bow, and opens the only path by which he can fall.", ["Bhishma Parva §108–119"]),
    j(10, "The Sleeping Camp", "Having survived the war that fulfilled the earlier vow, Shikhandi dies during Ashwatthama's night assault.", ["Sauptika Parva §8"]),
  ],
  uttara: [
    j(4, "Student of Brihannala", "Uttara learns dance from the disguised Arjuna, unaware that the gentle teacher in the women's quarters is the warrior her house shelters.", ["Virata Parva §9–13"]),
    j(7, "A Bride Widowed", "She marries Abhimanyu and loses him almost immediately to the chakravyuha, carrying their unborn child through the remaining war.", ["Virata Parva §72", "Drona Parva §72"]),
    j(14, "The Child Returned", "Ashwatthama's weapon kills the heir in her womb, and Krishna restores Parikshit, preserving the dynasty through Uttara's body.", ["Ashvamedhika Parva §68–70"]),
  ],
  virata: [
    j(4, "A Kingdom Full of Strangers", "Virata hires a dice-player, cook, dance teacher, horse keeper, cattle keeper, and maid without recognizing the exiled Pandavas and Draupadi beneath their roles.", ["Virata Parva §7–13"]),
    j(4, "The Cattle War", "The hidden guests save Matsya from attacks on two fronts, and revelation converts shelter into alliance through the marriage of Uttara and Abhimanyu.", ["Virata Parva §30–72"]),
    j(7, "The Fifteenth Morning", "Virata fights beside Drupada until Drona kills both allied kings during his final and most destructive command.", ["Drona Parva §186"]),
  ],
  ghatotkacha: [
    j(1, "The Forest Son", "Born to Bhima and Hidimbi, Ghatotkacha grows at once into a rakshasa prince who promises to answer whenever his father calls.", ["Adi Parva §157"]),
    j(3, "Bearer Through the Mountains", "During exile he carries Draupadi and the Pandavas across terrain where human strength and roads fail.", ["Vana Parva §144"]),
    j(7, "The Night Belongs to Him", "On the fourteenth night his illusions consume the Kaurava host until Karna spends Indra's unfailing spear, saving Arjuna by killing Bhima's son.", ["Drona Parva §173–180"]),
  ],
  jayadratha: [
    j(3, "The Abduction in the Forest", "Jayadratha carries Draupadi away while the brothers are absent, is captured, humiliated, and released into a resentment that seeks divine power.", ["Vana Parva §262–271"]),
    j(7, "The Gate Closed", "Shiva's boon lets him hold back four Pandavas for one day, and he uses it to seal the chakravyuha behind Abhimanyu.", ["Drona Parva §42–48"]),
    j(7, "Before the False Sunset", "Arjuna vows his death by sundown. Krishna's veil of darkness draws Jayadratha from protection, and the arrow carries his head beyond the field.", ["Drona Parva §145–146"]),
  ],
  shalya: [
    j(5, "Hospitality as a Snare", "Marching to aid his nephews, Shalya accepts lavish hospitality before learning it came from Duryodhana and binds himself to the Kaurava side.", ["Udyoga Parva §8"]),
    j(8, "The Charioteer Who Wounds", "As Karna's driver he answers every boast with praise of Arjuna, spending counsel as demoralization while still holding the reins through the final duel.", ["Karna Parva §26–45"]),
    j(9, "Last Commander", "He gathers the remnant army on the eighteenth morning and falls to Yudhishthira's spear, the gentlest Pandava killing the last commander.", ["Shalya Parva §5–17"]),
  ],
  sanjaya: [
    j(5, "The Last Embassy", "Sanjaya carries Dhritarashtra's words to the Pandava camp and returns with the clearest possible measure of the force and resolve now facing Hastinapura.", ["Udyoga Parva §22–32"]),
    j(6, "Sight Given for a Blind King", "Vyasa grants him distant vision, and from the palace he narrates formations, deaths, and the dialogue of Krishna and Arjuna as if standing between the armies.", ["Bhishma Parva §2–13"]),
    j(9, "The Report Ends", "When Duryodhana falls, Sanjaya's divine sight leaves him. The broadcaster of the war returns to ordinary vision in an extraordinary ruin.", ["Shalya Parva §28–29"]),
  ],
  ekalavya: [
    j(1, "Before the Clay Teacher", "Refused by Drona, Ekalavya builds the teacher's image in the forest and disciplines himself until his arrows can close a barking dog's mouth without drawing blood.", ["Adi Parva §132"]),
    j(1, "The Tuition", "When Arjuna's promised supremacy is threatened, Drona asks for Ekalavya's right thumb as fee. The forest prince cuts it off and gives it without bargaining.", ["Adi Parva §132"]),
  ],
  parikshit: [
    j(1, "The Bite and the Recitation", "Parikshit's death by Takshaka drives Janamejaya's snake sacrifice, where the history of his ancestors is recited and the epic closes its frame.", ["Adi Parva §40–58"]),
    j(14, "Killed Before Birth", "Ashwatthama directs the final weapon toward the Pandava womb, and Uttara's child dies before seeing the kingdom he alone can inherit.", ["Ashvamedhika Parva §68–70"]),
    j(14, "The Tested One", "Krishna restores the infant and names him Parikshit, the tested survivor through whom the Kuru line continues after every army has vanished.", ["Ashvamedhika Parva §68–70"]),
  ],
};
