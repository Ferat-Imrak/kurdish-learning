import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const SKY = '#EAF3FF';
const SKY_DEEPER = '#d6e8ff';
const TEXT_PRIMARY = '#0F172A';
import { useGamesProgressStore } from '../../lib/store/gamesProgressStore';
import CategoryCard from '../components/CategoryCard';
import {
  MATCHING_CATEGORY_IDS,
  CATEGORY_ICONS,
  CATEGORY_DISPLAY_NAMES,
} from '../../lib/data/game-data';

const BRAND_BLUE = '#3A86FF';

type Sentence = { id: string; english: string; kurdish: string; words: string[] };

const colorsSentences: Sentence[] = [
  { id: 'colors-1', english: 'The apple is red.', kurdish: 'Sêv sor e.', words: ['Sêv', 'sor', 'e'] },
  { id: 'colors-2', english: 'The grass is green.', kurdish: 'Gîya kesk e.', words: ['Gîya', 'kesk', 'e'] },
  { id: 'colors-3', english: 'The sky is blue.', kurdish: 'Esman şîn e.', words: ['Esman', 'şîn', 'e'] },
  { id: 'colors-4', english: 'The sun is yellow.', kurdish: 'Roj zer e.', words: ['Roj', 'zer', 'e'] },
  { id: 'colors-5', english: 'I like red color.', kurdish: 'Ez ji rengê sor hez dikim.', words: ['Ez', 'ji', 'rengê', 'sor', 'hez', 'dikim'] },
  { id: 'colors-6', english: 'The car is black.', kurdish: 'Otomobîl reş e.', words: ['Otomobîl', 'reş', 'e'] },
  { id: 'colors-7', english: 'The snow is white.', kurdish: 'Berf spî ye.', words: ['Berf', 'spî', 'ye'] },
  { id: 'colors-8', english: 'I see a purple flower.', kurdish: 'Ez gulek mor dibînim.', words: ['Ez', 'gulek', 'mor', 'dibînim'] },
  { id: 'colors-9', english: 'The orange is orange.', kurdish: 'Pirteqal porteqalî ye.', words: ['Pirteqal', 'porteqalî', 'ye'] },
  { id: 'colors-10', english: 'My shirt is blue.', kurdish: 'Kirasê min şîn e.', words: ['Kirasê', 'min', 'şîn', 'e'] },
  { id: 'colors-11', english: 'The book is brown.', kurdish: 'Pirtûk qehweyî ye.', words: ['Pirtûk', 'qehweyî', 'ye'] },
  { id: 'colors-12', english: 'I like green color.', kurdish: 'Ez ji rengê kesk hez dikim.', words: ['Ez', 'ji', 'rengê', 'kesk', 'hez', 'dikim'] },
  { id: 'colors-13', english: 'The rose is red.', kurdish: 'Gul sor e.', words: ['Gul', 'sor', 'e'] },
  { id: 'colors-14', english: 'Your dress is yellow.', kurdish: 'Kirasê te zer e.', words: ['Kirasê', 'te', 'zer', 'e'] },
  { id: 'colors-15', english: 'We paint the wall white.', kurdish: 'Em dîwarê spî dikin.', words: ['Em', 'dîwarê', 'spî', 'dikin'] },
];
const animalsSentences: Sentence[] = [
  { id: 'animals-1', english: 'The cat is sleeping.', kurdish: 'Pisîk radizê.', words: ['Pisîk', 'radizê'] },
  { id: 'animals-2', english: 'The dog is running.', kurdish: 'Se direyê.', words: ['Se', 'direyê'] },
  { id: 'animals-3', english: 'I see a bird.', kurdish: 'Ez balindek dibînim.', words: ['Ez', 'balindek', 'dibînim'] },
  { id: 'animals-4', english: 'The horse is fast.', kurdish: 'Hesp lezgîn e.', words: ['Hesp', 'lezgîn', 'e'] },
  { id: 'animals-5', english: 'I love animals.', kurdish: 'Ez ji ajelan hez dikim.', words: ['Ez', 'ji', 'ajelan', 'hez', 'dikim'] },
  { id: 'animals-6', english: 'The cow gives milk.', kurdish: 'Çêlek şîr dide.', words: ['Çêlek', 'şîr', 'dide'] },
  { id: 'animals-7', english: 'I hear a bird singing.', kurdish: 'Ez balindekê dibihîzim ku stran dike.', words: ['Ez', 'balindekê', 'dibihîzim', 'ku', 'stran', 'dike'] },
  { id: 'animals-8', english: 'The fish swims in water.', kurdish: 'Masî di avê de ajnê dike.', words: ['Masî', 'di', 'avê', 'de', 'ajnê', 'dike'] },
  { id: 'animals-9', english: 'My cat is small.', kurdish: 'Pisîka min biçûk e.', words: ['Pisîka', 'min', 'biçûk', 'e'] },
  { id: 'animals-10', english: 'The lion is strong.', kurdish: 'Şêr bihêz e.', words: ['Şêr', 'bihêz', 'e'] },
  { id: 'animals-11', english: 'I see two dogs.', kurdish: 'Ez du se dibînim.', words: ['Ez', 'du', 'se', 'dibînim'] },
  { id: 'animals-12', english: 'The bird flies in the sky.', kurdish: 'Balinde di esmanê de difire.', words: ['Balinde', 'di', 'esmanê', 'de', 'difire'] },
  { id: 'animals-13', english: 'The rabbit is fast.', kurdish: 'Kevroşk lezgîn e.', words: ['Kevroşk', 'lezgîn', 'e'] },
  { id: 'animals-14', english: 'We feed the animals.', kurdish: 'Em ajelan xwedî dikin.', words: ['Em', 'ajelan', 'xwedî', 'dikin'] },
  { id: 'animals-15', english: 'The sheep is white.', kurdish: 'Pez spî ye.', words: ['Pez', 'spî', 'ye'] },
];
const foodSentences: Sentence[] = [
  { id: 'food-1', english: 'I eat bread.', kurdish: 'Ez nan dixwim.', words: ['Ez', 'nan', 'dixwim'] },
  { id: 'food-2', english: 'You drink tea.', kurdish: 'Tu çayê vedixwî.', words: ['Tu', 'çayê', 'vedixwî'] },
  { id: 'food-3', english: 'We cook food.', kurdish: 'Em xwarinê çêdikin.', words: ['Em', 'xwarinê', 'çêdikin'] },
  { id: 'food-4', english: 'I like apples.', kurdish: 'Ez ji sêvan hez dikim.', words: ['Ez', 'ji', 'sêvan', 'hez', 'dikim'] },
  { id: 'food-5', english: 'The food is good.', kurdish: 'Xwarinê baş e.', words: ['Xwarinê', 'baş', 'e'] },
  { id: 'food-6', english: 'I buy vegetables.', kurdish: 'Ez sebze dikirim.', words: ['Ez', 'sebze', 'dikirim'] },
  { id: 'food-7', english: 'We eat breakfast in the morning.', kurdish: 'Em di sibehê de taştê dixwin.', words: ['Em', 'di', 'sibehê', 'de', 'taştê', 'dixwin'] },
  { id: 'food-8', english: 'The apple is sweet.', kurdish: 'Sêv şîrîn e.', words: ['Sêv', 'şîrîn', 'e'] },
  { id: 'food-9', english: 'I drink water.', kurdish: 'Ez avê vedixwim.', words: ['Ez', 'avê', 'vedixwim'] },
  { id: 'food-10', english: 'You eat rice.', kurdish: 'Tu birinc dixwî.', words: ['Tu', 'birinc', 'dixwî'] },
  { id: 'food-11', english: 'We make soup.', kurdish: 'Em şorbe çêdikin.', words: ['Em', 'şorbe', 'çêdikin'] },
  { id: 'food-12', english: 'I like meat.', kurdish: 'Ez ji goşt hez dikim.', words: ['Ez', 'ji', 'goşt', 'hez', 'dikim'] },
  { id: 'food-13', english: 'The milk is cold.', kurdish: 'Şîr sar e.', words: ['Şîr', 'sar', 'e'] },
  { id: 'food-14', english: 'I cook eggs.', kurdish: 'Ez hêkan çêdikim.', words: ['Ez', 'hêkan', 'çêdikim'] },
  { id: 'food-15', english: 'We eat dinner at night.', kurdish: 'Em di şevê de xwarina êvarê dixwin.', words: ['Em', 'di', 'şevê', 'de', 'xwarina', 'êvarê', 'dixwin'] },
];
const familySentences: Sentence[] = [
  { id: 'family-1', english: 'My mother is kind.', kurdish: 'Dayika min qenc e.', words: ['Dayika', 'min', 'qenc', 'e'] },
  { id: 'family-2', english: 'My father works.', kurdish: 'Bavê min kar dike.', words: ['Bavê', 'min', 'kar', 'dike'] },
  { id: 'family-3', english: 'I love my family.', kurdish: 'Ez ji malbata xwe hez dikim.', words: ['Ez', 'ji', 'malbata', 'xwe', 'hez', 'dikim'] },
  { id: 'family-4', english: 'My sister is young.', kurdish: 'Xwişka min ciwan e.', words: ['Xwişka', 'min', 'ciwan', 'e'] },
  { id: 'family-5', english: 'My brother is tall.', kurdish: 'Birayê min dirêj e.', words: ['Birayê', 'min', 'dirêj', 'e'] },
  { id: 'family-6', english: 'My grandmother is old.', kurdish: 'Dapîra min kal e.', words: ['Dapîra', 'min', 'kal', 'e'] },
  { id: 'family-7', english: 'I visit my grandfather.', kurdish: 'Ez bapîra xwe serdan dikim.', words: ['Ez', 'bapîra', 'xwe', 'serdan', 'dikim'] },
  { id: 'family-8', english: 'My uncle is a teacher.', kurdish: 'Apê min mamoste ye.', words: ['Apê', 'min', 'mamoste', 'ye'] },
  { id: 'family-9', english: 'I have a big family.', kurdish: 'Malbateke mezin min heye.', words: ['Malbateke', 'mezin', 'min', 'heye'] },
  { id: 'family-10', english: 'My cousin is my friend.', kurdish: 'Pismama min hevalê min e.', words: ['Pismama', 'min', 'hevalê', 'min', 'e'] },
  { id: 'family-11', english: 'We are a happy family.', kurdish: 'Em malbateke kêfxweş in.', words: ['Em', 'malbateke', 'kêfxweş', 'in'] },
  { id: 'family-12', english: 'My aunt is kind.', kurdish: 'Metê min qenc e.', words: ['Metê', 'min', 'qenc', 'e'] },
  { id: 'family-13', english: 'I love my parents.', kurdish: 'Ez ji dêûbavên xwe hez dikim.', words: ['Ez', 'ji', 'dêûbavên', 'xwe', 'hez', 'dikim'] },
  { id: 'family-14', english: 'My nephew is a child.', kurdish: 'Kurê birayê min zarok e.', words: ['Kurê', 'birayê', 'min', 'zarok', 'e'] },
  { id: 'family-15', english: 'We eat together as a family.', kurdish: 'Em wek malbat bi hev re dixwin.', words: ['Em', 'wek', 'malbat', 'bi', 'hev', 're', 'dixwin'] },
];
const natureSentences: Sentence[] = [
  { id: 'nature-1', english: 'The tree is tall.', kurdish: 'Dare dirêj e.', words: ['Dare', 'dirêj', 'e'] },
  { id: 'nature-2', english: 'The flower is beautiful.', kurdish: 'Gul xweşik e.', words: ['Gul', 'xweşik', 'e'] },
  { id: 'nature-3', english: 'I see a mountain.', kurdish: 'Ez çiyayek dibînim.', words: ['Ez', 'çiyayek', 'dibînim'] },
  { id: 'nature-4', english: 'The sun is shining.', kurdish: 'Roj dişewitê.', words: ['Roj', 'dişewitê'] },
  { id: 'nature-5', english: 'We walk in the forest.', kurdish: 'Em di daristanê de digerin.', words: ['Em', 'di', 'daristanê', 'de', 'digerin'] },
  { id: 'nature-6', english: 'The river flows.', kurdish: 'Çem diherike.', words: ['Çem', 'diherike'] },
  { id: 'nature-7', english: 'I see a beautiful lake.', kurdish: 'Ez golek xweşik dibînim.', words: ['Ez', 'golek', 'xweşik', 'dibînim'] },
  { id: 'nature-8', english: 'The moon is bright.', kurdish: 'Hîv ronî ye.', words: ['Hîv', 'ronî', 'ye'] },
  { id: 'nature-9', english: 'We climb the mountain.', kurdish: 'Em çiyayê radikin.', words: ['Em', 'çiyayê', 'radikin'] },
  { id: 'nature-10', english: 'The leaf falls from the tree.', kurdish: 'Pel ji dare diqewime.', words: ['Pel', 'ji', 'dare', 'diqewime'] },
  { id: 'nature-11', english: 'I love nature.', kurdish: 'Ez ji xwezayê hez dikim.', words: ['Ez', 'ji', 'xwezayê', 'hez', 'dikim'] },
  { id: 'nature-12', english: 'The star shines at night.', kurdish: 'Stêr di şevê de dibiriqe.', words: ['Stêr', 'di', 'şevê', 'de', 'dibiriqe'] },
  { id: 'nature-13', english: 'The grass is green.', kurdish: 'Gîya kesk e.', words: ['Gîya', 'kesk', 'e'] },
  { id: 'nature-14', english: 'We swim in the sea.', kurdish: 'Em di deryayê de ajnê dikin.', words: ['Em', 'di', 'deryayê', 'de', 'ajnê', 'dikin'] },
  { id: 'nature-15', english: 'The wind blows.', kurdish: 'Ba diweje.', words: ['Ba', 'diweje'] },
];
const timeSentences: Sentence[] = [
  { id: 'time-1', english: 'It is morning.', kurdish: 'Sibeh e.', words: ['Sibeh', 'e'] },
  { id: 'time-2', english: 'I wake up early.', kurdish: 'Ez zû radihêzim.', words: ['Ez', 'zû', 'radihêzim'] },
  { id: 'time-3', english: 'What time is it?', kurdish: 'Saet çend e?', words: ['Saet', 'çend', 'e'] },
  { id: 'time-4', english: 'I go to school at eight.', kurdish: 'Ez saet heştan diçim dibistanê.', words: ['Ez', 'saet', 'heştan', 'diçim', 'dibistanê'] },
  { id: 'time-5', english: 'We eat lunch at noon.', kurdish: 'Em di nîvro de xwarina nîvro dixwin.', words: ['Em', 'di', 'nîvro', 'de', 'xwarina', 'nîvro', 'dixwin'] },
  { id: 'time-6', english: 'It is afternoon.', kurdish: 'Nîvro ye.', words: ['Nîvro', 'ye'] },
  { id: 'time-7', english: 'I sleep at night.', kurdish: 'Ez di şevê de radizim.', words: ['Ez', 'di', 'şevê', 'de', 'radizim'] },
  { id: 'time-8', english: 'What day is today?', kurdish: 'Îro çi roj e?', words: ['Îro', 'çi', 'roj', 'e'] },
  { id: 'time-9', english: 'I work during the day.', kurdish: 'Ez di rojê de kar dikim.', words: ['Ez', 'di', 'rojê', 'de', 'kar', 'dikim'] },
  { id: 'time-10', english: 'It is evening now.', kurdish: 'Niha êvar e.', words: ['Niha', 'êvar', 'e'] },
  { id: 'time-11', english: 'We meet tomorrow.', kurdish: 'Em sibê hevdîtin dikin.', words: ['Em', 'sibê', 'hevdîtin', 'dikin'] },
  { id: 'time-12', english: 'I study in the morning.', kurdish: 'Ez di sibehê de xwendinê dikim.', words: ['Ez', 'di', 'sibehê', 'de', 'xwendinê', 'dikim'] },
  { id: 'time-13', english: 'The clock shows the time.', kurdish: 'Saet demê nîşan dide.', words: ['Saet', 'demê', 'nîşan', 'dide'] },
  { id: 'time-14', english: 'I come at seven.', kurdish: 'Ez saet heftan tên.', words: ['Ez', 'saet', 'heftan', 'tên'] },
  { id: 'time-15', english: 'We play in the afternoon.', kurdish: 'Em di nîvro de dilîzin.', words: ['Em', 'di', 'nîvro', 'de', 'dilîzin'] },
];
const weatherSentences: Sentence[] = [
  { id: 'weather-1', english: 'It is sunny today.', kurdish: 'Îro roj heye.', words: ['Îro', 'roj', 'heye'] },
  { id: 'weather-2', english: 'It is raining.', kurdish: 'Baran dibare.', words: ['Baran', 'dibare'] },
  { id: 'weather-3', english: 'The weather is cold.', kurdish: 'Hewa sar e.', words: ['Hewa', 'sar', 'e'] },
  { id: 'weather-4', english: 'It is hot in summer.', kurdish: 'Di havînê de germ e.', words: ['Di', 'havînê', 'de', 'germ', 'e'] },
  { id: 'weather-5', english: 'I like spring weather.', kurdish: 'Ez ji hewaya biharê hez dikim.', words: ['Ez', 'ji', 'hewaya', 'biharê', 'hez', 'dikim'] },
  { id: 'weather-6', english: 'It snows in winter.', kurdish: 'Di zivistanê de berf dibare.', words: ['Di', 'zivistanê', 'de', 'berf', 'dibare'] },
  { id: 'weather-7', english: 'The wind is strong.', kurdish: 'Ba bihêz e.', words: ['Ba', 'bihêz', 'e'] },
  { id: 'weather-8', english: 'I see clouds in the sky.', kurdish: 'Ez ewr di esmanê de dibînim.', words: ['Ez', 'ewr', 'di', 'esmanê', 'de', 'dibînim'] },
  { id: 'weather-9', english: 'The weather is nice today.', kurdish: 'Îro hewa baş e.', words: ['Îro', 'hewa', 'baş', 'e'] },
  { id: 'weather-10', english: 'It is warm in spring.', kurdish: 'Di biharê de germ e.', words: ['Di', 'biharê', 'de', 'germ', 'e'] },
  { id: 'weather-11', english: 'The sun is hot.', kurdish: 'Roj germ e.', words: ['Roj', 'germ', 'e'] },
  { id: 'weather-12', english: 'I like rainy days.', kurdish: 'Ez ji rojên baranî hez dikim.', words: ['Ez', 'ji', 'rojên', 'baranî', 'hez', 'dikim'] },
  { id: 'weather-13', english: 'The storm is coming.', kurdish: 'Bahoz tê.', words: ['Bahoz', 'tê'] },
  { id: 'weather-14', english: 'We stay inside when it rains.', kurdish: 'Gava baran dibare em di hundur de dimînin.', words: ['Gava', 'baran', 'dibare', 'em', 'di', 'hundur', 'de', 'dimînin'] },
  { id: 'weather-15', english: 'The weather changes.', kurdish: 'Hewa diguhere.', words: ['Hewa', 'diguhere'] },
];
const houseSentences: Sentence[] = [
  { id: 'house-1', english: 'The chair is in the room.', kurdish: 'Kursî di odeyê de ye.', words: ['Kursî', 'di', 'odeyê', 'de', 'ye'] },
  { id: 'house-2', english: 'I sit on the chair.', kurdish: 'Ez li ser kursiyê rû dinim.', words: ['Ez', 'li', 'ser', 'kursiyê', 'rû', 'dinim'] },
  { id: 'house-3', english: 'The table is big.', kurdish: 'Mase mezin e.', words: ['Mase', 'mezin', 'e'] },
  { id: 'house-4', english: 'I open the door.', kurdish: 'Ez deriyê vedikim.', words: ['Ez', 'deriyê', 'vedikim'] },
  { id: 'house-5', english: 'The window is open.', kurdish: 'Pencere vekirî ye.', words: ['Pencere', 'vekirî', 'ye'] },
  { id: 'house-6', english: 'I close the window.', kurdish: 'Ez pencereyê digirim.', words: ['Ez', 'pencereyê', 'digirim'] },
  { id: 'house-7', english: 'The bed is in the bedroom.', kurdish: 'Nivîn di odeya razanê de ye.', words: ['Nivîn', 'di', 'odeya', 'razanê', 'de', 'ye'] },
  { id: 'house-8', english: 'I sleep in my bed.', kurdish: 'Ez di nivîna xwe de radizim.', words: ['Ez', 'di', 'nivîna', 'xwe', 'de', 'radizim'] },
  { id: 'house-9', english: 'The lamp is on the table.', kurdish: 'Lampa li ser maseyê ye.', words: ['Lampa', 'li', 'ser', 'maseyê', 'ye'] },
  { id: 'house-10', english: 'I turn on the light.', kurdish: 'Ez ronahiyê vekim.', words: ['Ez', 'ronahiyê', 'vekim'] },
  { id: 'house-11', english: 'The kitchen is clean.', kurdish: 'Aşxane paqij e.', words: ['Aşxane', 'paqij', 'e'] },
  { id: 'house-12', english: 'We cook in the kitchen.', kurdish: 'Em di aşxaneyê de xwarinê çêdikin.', words: ['Em', 'di', 'aşxaneyê', 'de', 'xwarinê', 'çêdikin'] },
  { id: 'house-13', english: 'The bathroom is small.', kurdish: 'Hemam biçûk e.', words: ['Hemam', 'biçûk', 'e'] },
  { id: 'house-14', english: 'I clean the house.', kurdish: 'Ez malê paqij dikim.', words: ['Ez', 'malê', 'paqij', 'dikim'] },
  { id: 'house-15', english: 'The room is big.', kurdish: 'Ode mezin e.', words: ['Ode', 'mezin', 'e'] },
];
const numbersSentences: Sentence[] = [
  { id: 'numbers-1', english: 'I have one book.', kurdish: 'Min pirtûkek heye.', words: ['Min', 'pirtûkek', 'heye'] },
  { id: 'numbers-2', english: 'Two and two is four.', kurdish: 'Du û du çar e.', words: ['Du', 'û', 'du', 'çar', 'e'] },
  { id: 'numbers-3', english: 'I see five birds.', kurdish: 'Ez pênc balinde dibînim.', words: ['Ez', 'pênc', 'balinde', 'dibînim'] },
  { id: 'numbers-4', english: 'There are ten students.', kurdish: 'Deh xwendekar hene.', words: ['Deh', 'xwendekar', 'hene'] },
  { id: 'numbers-5', english: 'I am twenty years old.', kurdish: 'Ez bîst salî me.', words: ['Ez', 'bîst', 'salî', 'me'] },
];
const daysMonthsSentences: Sentence[] = [
  { id: 'days-1', english: 'Today is Monday.', kurdish: 'Îro duşem e.', words: ['Îro', 'duşem', 'e'] },
  { id: 'days-2', english: 'Tomorrow is Tuesday.', kurdish: 'Sibê sêşem e.', words: ['Sibê', 'sêşem', 'e'] },
  { id: 'days-3', english: 'This month is January.', kurdish: 'Ev meh çile ye.', words: ['Ev', 'meh', 'çile', 'ye'] },
  { id: 'days-4', english: 'My birthday is in May.', kurdish: 'Rojbûna min di gulanê de ye.', words: ['Rojbûna', 'min', 'di', 'gulanê', 'de', 'ye'] },
  { id: 'days-5', english: 'We meet on Friday.', kurdish: 'Em di înê de hevdîtin dikin.', words: ['Em', 'di', 'înê', 'de', 'hevdîtin', 'dikin'] },
  { id: 'days-6', english: 'Today is Wednesday.', kurdish: 'Îro çarşem e.', words: ['Îro', 'çarşem', 'e'] },
  { id: 'days-7', english: 'I work on Saturday.', kurdish: 'Ez di şemiyê de kar dikim.', words: ['Ez', 'di', 'şemiyê', 'de', 'kar', 'dikim'] },
  { id: 'days-8', english: 'Sunday is a holiday.', kurdish: 'Yekşem rojek betlaneyê ye.', words: ['Yekşem', 'rojek', 'betlaneyê', 'ye'] },
  { id: 'days-9', english: 'This month is February.', kurdish: 'Ev meh sibat e.', words: ['Ev', 'meh', 'sibat', 'e'] },
  { id: 'days-10', english: 'Spring starts in March.', kurdish: 'Bihar di adarê de dest pê dike.', words: ['Bihar', 'di', 'adarê', 'de', 'dest', 'pê', 'dike'] },
  { id: 'days-11', english: 'I was born in June.', kurdish: 'Ez di hezîranê de hatim dinê.', words: ['Ez', 'di', 'hezîranê', 'de', 'hatim', 'dinê'] },
  { id: 'days-12', english: 'We go on vacation in July.', kurdish: 'Em di tîrmehê de diçin betlaneyê.', words: ['Em', 'di', 'tîrmehê', 'de', 'diçin', 'betlaneyê'] },
  { id: 'days-13', english: 'September is autumn.', kurdish: 'Îlon payiz e.', words: ['Îlon', 'payiz', 'e'] },
  { id: 'days-14', english: 'Winter comes in December.', kurdish: 'Zivistan di kanûnê de tê.', words: ['Zivistan', 'di', 'kanûnê', 'de', 'tê'] },
  { id: 'days-15', english: 'Every day is a new day.', kurdish: 'Her roj rojek nû ye.', words: ['Her', 'roj', 'rojek', 'nû', 'ye'] },
];
const questionsSentences: Sentence[] = [
  { id: 'questions-1', english: 'Who is that?', kurdish: 'Ew kî ye?', words: ['Ew', 'kî', 'ye'] },
  { id: 'questions-2', english: 'What is your name?', kurdish: 'Navê te çi ye?', words: ['Navê', 'te', 'çi', 'ye'] },
  { id: 'questions-3', english: 'Where are you from?', kurdish: 'Tu ji ku yî?', words: ['Tu', 'ji', 'ku', 'yî'] },
  { id: 'questions-4', english: 'When do you come?', kurdish: 'Tu kengî tê?', words: ['Tu', 'kengî', 'tê'] },
  { id: 'questions-5', english: 'How many books do you have?', kurdish: 'Çend pirtûkên te hene?', words: ['Çend', 'pirtûkên', 'te', 'hene'] },
  { id: 'questions-6', english: 'How are you?', kurdish: 'Tu çawa yî?', words: ['Tu', 'çawa', 'yî'] },
  { id: 'questions-7', english: 'Why are you here?', kurdish: 'Tu çima li vir yî?', words: ['Tu', 'çima', 'li', 'vir', 'yî'] },
  { id: 'questions-8', english: 'What do you want?', kurdish: 'Tu çi dixwazî?', words: ['Tu', 'çi', 'dixwazî'] },
  { id: 'questions-9', english: 'Where do you live?', kurdish: 'Tu li ku dijî?', words: ['Tu', 'li', 'ku', 'dijî'] },
  { id: 'questions-10', english: 'What time is it?', kurdish: 'Saet çend e?', words: ['Saet', 'çend', 'e'] },
  { id: 'questions-11', english: 'How old are you?', kurdish: 'Tu çend salî yî?', words: ['Tu', 'çend', 'salî', 'yî'] },
  { id: 'questions-12', english: 'What do you do?', kurdish: 'Tu çi kar dikî?', words: ['Tu', 'çi', 'kar', 'dikî'] },
  { id: 'questions-13', english: 'Which book do you read?', kurdish: 'Tu kîjan pirtûkê dixwînî?', words: ['Tu', 'kîjan', 'pirtûkê', 'dixwînî'] },
  { id: 'questions-14', english: 'Where is the school?', kurdish: 'Dibistan li ku ye?', words: ['Dibistan', 'li', 'ku', 'ye'] },
  { id: 'questions-15', english: 'What is this?', kurdish: 'Ev çi ye?', words: ['Ev', 'çi', 'ye'] },
];
const pronounsSentences: Sentence[] = [
  { id: 'pronouns-1', english: 'I am a student.', kurdish: 'Ez xwendekar im.', words: ['Ez', 'xwendekar', 'im'] },
  { id: 'pronouns-2', english: 'You are my friend.', kurdish: 'Tu hevalê min î.', words: ['Tu', 'hevalê', 'min', 'î'] },
  { id: 'pronouns-3', english: 'We are here.', kurdish: 'Em li vir in.', words: ['Em', 'li', 'vir', 'in'] },
  { id: 'pronouns-4', english: 'They are students.', kurdish: 'Ew xwendekar in.', words: ['Ew', 'xwendekar', 'in'] },
  { id: 'pronouns-5', english: 'This is my book.', kurdish: 'Ev pirtûka min e.', words: ['Ev', 'pirtûka', 'min', 'e'] },
  { id: 'pronouns-6', english: 'That is your car.', kurdish: 'Ew otomobîla te ye.', words: ['Ew', 'otomobîla', 'te', 'ye'] },
  { id: 'pronouns-7', english: 'He is a teacher.', kurdish: 'Ew mamoste ye.', words: ['Ew', 'mamoste', 'ye'] },
  { id: 'pronouns-8', english: 'She is my sister.', kurdish: 'Ew xwişka min e.', words: ['Ew', 'xwişka', 'min', 'e'] },
  { id: 'pronouns-9', english: 'We are friends.', kurdish: 'Em heval in.', words: ['Em', 'heval', 'in'] },
  { id: 'pronouns-10', english: 'You are students.', kurdish: 'Hûn xwendekar in.', words: ['Hûn', 'xwendekar', 'in'] },
  { id: 'pronouns-11', english: 'I see them.', kurdish: 'Ez wan dibînim.', words: ['Ez', 'wan', 'dibînim'] },
  { id: 'pronouns-12', english: 'This is our house.', kurdish: 'Ev mala me ye.', words: ['Ev', 'mala', 'me', 'ye'] },
  { id: 'pronouns-13', english: 'That is their car.', kurdish: 'Ew otomobîla wan e.', words: ['Ew', 'otomobîla', 'wan', 'e'] },
  { id: 'pronouns-14', english: 'I give it to you.', kurdish: 'Ez wê didim te.', words: ['Ez', 'wê', 'didim', 'te'] },
  { id: 'pronouns-15', english: 'We help them.', kurdish: 'Em alîkariya wan dikin.', words: ['Em', 'alîkariya', 'wan', 'dikin'] },
];
const bodyPartsSentences: Sentence[] = [
  { id: 'body-1', english: 'My head hurts.', kurdish: 'Serê min diêşe.', words: ['Serê', 'min', 'diêşe'] },
  { id: 'body-2', english: 'I see with my eyes.', kurdish: 'Ez bi çavên xwe dibînim.', words: ['Ez', 'bi', 'çavên', 'xwe', 'dibînim'] },
  { id: 'body-3', english: 'I hear with my ears.', kurdish: 'Ez bi guhên xwe dibihîzim.', words: ['Ez', 'bi', 'guhên', 'xwe', 'dibihîzim'] },
  { id: 'body-4', english: 'My hand is big.', kurdish: 'Destê min mezin e.', words: ['Destê', 'min', 'mezin', 'e'] },
  { id: 'body-5', english: 'I walk with my legs.', kurdish: 'Ez bi lingên xwe digerim.', words: ['Ez', 'bi', 'lingên', 'xwe', 'digerim'] },
  { id: 'body-6', english: 'I wash my face.', kurdish: 'Ez rûyê xwe dişom.', words: ['Ez', 'rûyê', 'xwe', 'dişom'] },
  { id: 'body-7', english: 'My foot is small.', kurdish: 'Pêya min biçûk e.', words: ['Pêya', 'min', 'biçûk', 'e'] },
  { id: 'body-8', english: 'I brush my teeth.', kurdish: 'Ez diranên xwe firçe dikim.', words: ['Ez', 'diranên', 'xwe', 'firçe', 'dikim'] },
  { id: 'body-9', english: 'My nose is big.', kurdish: 'Lûtê min mezin e.', words: ['Lûtê', 'min', 'mezin', 'e'] },
  { id: 'body-10', english: 'I touch with my hand.', kurdish: 'Ez bi destê xwe dest lê dikim.', words: ['Ez', 'bi', 'destê', 'xwe', 'dest', 'lê', 'dikim'] },
  { id: 'body-11', english: 'My shoulder hurts.', kurdish: 'Milê min diêşe.', words: ['Milê', 'min', 'diêşe'] },
  { id: 'body-12', english: 'I open my mouth.', kurdish: 'Ez devê xwe vedikim.', words: ['Ez', 'devê', 'xwe', 'vedikim'] },
  { id: 'body-13', english: 'My back is straight.', kurdish: 'Pişta min rast e.', words: ['Pişta', 'min', 'rast', 'e'] },
  { id: 'body-14', english: 'I move my arm.', kurdish: 'Ez çenga xwe dilivînim.', words: ['Ez', 'çenga', 'xwe', 'dilivînim'] },
  { id: 'body-15', english: 'My heart beats.', kurdish: 'Dilê min dilize.', words: ['Dilê', 'min', 'dilize'] },
];

const sentencesByCategoryId: Record<string, Sentence[]> = {
  colors: colorsSentences,
  animals: animalsSentences,
  food: foodSentences,
  family: familySentences,
  nature: natureSentences,
  time: timeSentences,
  weather: weatherSentences,
  house: houseSentences,
  numbers: numbersSentences,
  daysMonths: daysMonthsSentences,
  questions: questionsSentences,
  pronouns: pronounsSentences,
  bodyParts: bodyPartsSentences,
};

const allSentences: Sentence[] = [
  ...colorsSentences, ...animalsSentences, ...foodSentences, ...familySentences,
  ...natureSentences, ...timeSentences, ...weatherSentences, ...houseSentences,
  ...numbersSentences, ...daysMonthsSentences, ...questionsSentences, ...pronounsSentences,
  ...bodyPartsSentences,
];

const decks = [
  ...MATCHING_CATEGORY_IDS.map((id) => ({
    id,
    name: CATEGORY_DISPLAY_NAMES[id] || id,
    icon: CATEGORY_ICONS[id] || '📝',
    sentences: sentencesByCategoryId[id] || [],
  })).filter((d) => d.sentences.length > 0),
  {
    id: 'master',
    name: CATEGORY_DISPLAY_NAMES.master,
    icon: CATEGORY_ICONS.master,
    sentences: allSentences,
  },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SENTENCE_KEY = (name: string) => `sentence-builder-progress-${name}`;

export default function SentenceBuilderScreen() {
  const router = useRouter();
  const { getProgress: getGamesProgress, saveProgress: saveGamesProgress, data: gamesData } = useGamesProgressStore();
  const [selectedDeck, setSelectedDeck] = useState<typeof decks[0] | null>(null);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [built, setBuilt] = useState<string[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, { completed: number; total: number }>>({});

  const getProgress = (categoryName: string): { completed: number; total: number } | null => {
    const raw = getGamesProgress(SENTENCE_KEY(categoryName));
    if (!raw || typeof raw !== 'object' || !('completed' in (raw as object))) return null;
    return raw as { completed: number; total: number };
  };

  const saveProgress = async (categoryName: string, completed: number, total: number) => {
    const cur = getProgress(categoryName);
    if (!cur || completed > cur.completed) {
      await saveGamesProgress(SENTENCE_KEY(categoryName), { completed, total });
    }
  };

  useEffect(() => {
    const map: Record<string, { completed: number; total: number }> = {};
    for (const d of decks) {
      const p = getProgress(d.name);
      if (p) map[d.id] = p;
    }
    setProgressMap(map);
  }, [gamesData]);

  useEffect(() => {
    if (!selectedDeck) return;
    const raw = selectedDeck.sentences;
    const sessionSentences = selectedDeck.id === 'master'
      ? shuffle([...raw]).slice(0, 20)
      : shuffle([...raw]);
    setSentences(sessionSentences);
    setSentenceIndex(0);
    setBuilt([]);
    setShuffledWords([]);
  }, [selectedDeck]);

  useEffect(() => {
    if (sentences.length === 0) return;
    const s = sentences[sentenceIndex];
    if (!s) return;
    setShuffledWords(shuffle([...s.words]));
    setBuilt([]);
  }, [sentences, sentenceIndex]);

  const currentSentence = sentences[sentenceIndex];
  const handleWord = (word: string, idx: number) => {
    if (!currentSentence) return;
    const nextBuilt = [...built, word];
    setBuilt(nextBuilt);
    setShuffledWords((prev) => prev.filter((_, i) => i !== idx));
    if (nextBuilt.length === currentSentence.words.length) {
      const correct = nextBuilt.join(' ') === currentSentence.words.join(' ');
      if (correct && selectedDeck) {
        const completed = sentenceIndex + 1;
        const total = sentences.length;
        saveProgress(selectedDeck.name, completed, total);
        setProgressMap((prev) => ({ ...prev, [selectedDeck.id]: { completed, total } }));
      }
    }
  };

  const handleUndo = () => {
    if (built.length === 0) return;
    const last = built[built.length - 1];
    setBuilt((prev) => prev.slice(0, -1));
    setShuffledWords((prev) => [...prev, last]);
  };

  const isComplete = currentSentence && built.length === currentSentence.words.length;
  const isCorrect =
    currentSentence && built.join(' ') === currentSentence.words.join(' ');

  if (!selectedDeck) {
    return (
      <View style={styles.pageWrap}>
        <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backHit} hitSlop={8}>
              <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
            </Pressable>
            <Text style={styles.headerTitle}>Sentence Builder</Text>
            <View style={styles.headerRight} />
          </View>
        <Text style={styles.description}>
          Choose a category and build Kurdish sentences from word cards!
        </Text>
        <FlatList
          data={decks}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const p = progressMap[item.id];
            const total = item.id === 'master' ? 20 : item.sentences.length;
            const completed = p?.completed ?? 0;
            const pct = total ? Math.round((completed / total) * 100) : 0;
            const isDone = p && p.completed >= total;
            return (
              <CategoryCard
                title={item.name}
                subtitle={item.id === 'master' ? '20 sentences' : `${item.sentences.length} sentences`}
                icon={item.icon}
                progressPercent={pct}
                isCompleted={!!isDone}
                onPress={() => setSelectedDeck(item)}
              />
            );
          }}
          showsVerticalScrollIndicator={false}
        />
        </SafeAreaView>
      </View>
    );
  }

  if (!currentSentence) {
    return (
      <View style={styles.pageWrap}>
        <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.doneWrap}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={styles.doneTitle}>All sentences built!</Text>
          <Pressable style={styles.doneBtn} onPress={() => setSelectedDeck(null)}>
            <Text style={styles.doneBtnText}>Back to Categories</Text>
          </Pressable>
        </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.pageWrap}>
      <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => setSelectedDeck(null)} style={styles.backHit} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {selectedDeck.icon} {selectedDeck.name}
          </Text>
          <View style={styles.headerRight} />
        </View>
      <Text style={styles.progressText}>
        Sentence {sentenceIndex + 1} / {sentences.length}
      </Text>
      <ScrollView contentContainerStyle={styles.quizArea}>
        <View style={styles.englishCard}>
          <Text style={styles.englishText}>{currentSentence.english}</Text>
        </View>
        <Text style={styles.hintLabel}>Build the Kurdish sentence:</Text>
        <View style={styles.builtRow}>
          {built.map((w, i) => (
            <View key={i} style={styles.builtChip}>
              <Text style={styles.builtText}>{w}</Text>
            </View>
          ))}
        </View>
        {isComplete && (
          <Text style={[styles.resultText, isCorrect ? styles.resultCorrect : styles.resultWrong]}>
            {isCorrect ? '✓ Correct!' : '✗ Try again'}
          </Text>
        )}
        <View style={styles.wordsRow}>
          {shuffledWords.map((w, i) => (
            <Pressable
              key={`${w}-${i}`}
              style={styles.wordChip}
              onPress={() => handleWord(w, i)}
            >
              <Text style={styles.wordChipText}>{w}</Text>
            </Pressable>
          ))}
        </View>
        {built.length > 0 && !isComplete && (
          <Pressable style={styles.undoBtn} onPress={handleUndo}>
            <Text style={styles.undoBtnText}>Undo</Text>
          </Pressable>
        )}
        {isComplete && (
          <Pressable
            style={styles.nextBtn}
            onPress={() => setSentenceIndex((i) => i + 1)}
          >
            <Text style={styles.nextBtnText}>
              {sentenceIndex + 1 >= sentences.length ? 'Finish' : 'Next sentence'}
            </Text>
          </Pressable>
        )}
      </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageWrap: { flex: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    minHeight: 44,
  },
  backHit: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: TEXT_PRIMARY, letterSpacing: -0.5 },
  headerRight: { width: 44 },
  description: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  listContent: { paddingBottom: 40, paddingTop: 4 },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6b7280',
    marginVertical: 12,
  },
  quizArea: { padding: 16, paddingBottom: 40 },
  englishCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  englishText: { fontSize: 18, fontWeight: '600', color: '#111827', textAlign: 'center' },
  hintLabel: { fontSize: 14, color: '#6b7280', marginBottom: 12 },
  builtRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
    minHeight: 44,
  },
  builtChip: {
    backgroundColor: BRAND_BLUE,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  builtText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  resultText: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  resultCorrect: { color: '#10b981' },
  resultWrong: { color: '#ef4444' },
  wordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  wordChip: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  wordChipText: { fontSize: 16, color: '#111827' },
  undoBtn: {
    marginTop: 20,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  undoBtnText: { fontSize: 14, color: '#6b7280' },
  nextBtn: {
    marginTop: 24,
    backgroundColor: BRAND_BLUE,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextBtnText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  doneWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  doneEmoji: { fontSize: 56, marginBottom: 16 },
  doneTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 24 },
  doneBtn: {
    backgroundColor: BRAND_BLUE,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  doneBtnText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
});
