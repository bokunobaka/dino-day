// All words the game shows or speaks. Estonian is the default; add ?lang=en for English.
// Every entry is [estonian, english]; arrays (counting words etc.) come back as arrays.
// Keep sentences short and warm: the player is 4-6 years old.

const L = {
  'ui.title': ['Dinopäev', 'Dino Day'],
  'ui.tagline': ['Kuusteist dinoseiklust', 'Sixteen dino adventures'],
  'ui.play': ['▶ Mängi', '▶ Play'],
  'ui.day': ['Päev {n}', 'Day {n}'],
  'ui.empty': ['Tühi', 'Empty'],
  'ui.next': ['▶ Järgmine päev', '▶ Next day'],
  'ui.complete': ['{name} läbitud!', '{name} complete!'],
  'ui.final': ['Sa oled päris dinosaurus!', 'You are a real dinosaur!'],
  'ui.newSkin': ['Uus värv!', 'New colour!'],
  'ui.newHat': ['Uus müts!', 'New hat!'],
  'aria.quest': ['Mida nüüd teha?', 'What to do now'],
  'aria.sound': ['Heli', 'Sound'],
  'aria.bag': ['Kott', 'Bag'],
  'aria.skin': ['värv', 'colour'],
  'aria.hat': ['müts', 'hat'],
  'aria.done': ['Valmis', 'Done'],
  'wardrobe.pick': ['Vali värv ja müts!', 'Pick a colour and a hat!'],
  'wardrobe.locked': ['Selle saad päevi mängides!', 'You get this by playing the days!'],
  'map.title': ['Vali päev', 'Pick a day'],
  'book.title': ['Minu raamat', 'My book'],
  'book.stickers': ['Kleebised', 'Stickers'],
  'book.outfits': ['Riided', 'Outfits'],
  'book.stats': ['Mu saavutused', 'My achievements'],
  'book.photos': ['Pildid', 'Photos'],
  'book.noPhotos': ['Pilte veel pole', 'No photos yet'],
  'parent.title': ['Vanema nurk', 'Parent corner'],
  'parent.lang': ['Keel', 'Language'],
  'parent.volume': ['Helitugevus', 'Volume'],
  'parent.controls': ['Liikumine', 'Movement'],
  'parent.ctlBoth': ['Mõlemad', 'Both'],
  'parent.ctlTap': ['Puudutus', 'Tap'],
  'parent.ctlStick': ['Juhtkang', 'Joystick'],
  'parent.home': ['Tagasi orgu', 'Back to the valley'],
  'parent.toTitle': ['Algusekraan', 'Start screen'],
  'parent.reset': ['Alusta otsast', 'Start over'],
  'parent.resetSure': ['Kas oled kindel? Vajuta veel kord', 'Are you sure? Press again'],

  'pet.pick': ['Vali endale sõber!', 'Pick a friend!'],
  'pet.name.toomas': ['Toomas!', 'Toomas!'],
  'pet.name.rohi': ['Rohi!', 'Rohi!'],
  'pet.name.nublu': ['Nublu!', 'Nublu!'],
  'pet.name.tupsu': ['Tupsu!', 'Tupsu!'],
  'pet.name.murts': ['Mürts!', 'Mürts!'],
  'pet.name.kivi': ['Kivi!', 'Kivi!'],
  'tutorial.tap': ['Puuduta maad, et kõndida! Või hoia sõrme all ja lohista!', 'Tap the ground to walk! Or hold your finger down and drag!'],

  'hub.welcome': ['Tere tulemast koju, dino! Puuduta, mida tahad teha.', 'Welcome home, little dino! Tap what you want to do.'],
  'hub.ride': ['Lendame pterodaktüüliga!', 'Let us fly on a pterodactyl!'],
  'hub.dance': ['Tuleme trampima!', 'Let us stomp!'],
  'hub.map': ['Vali, millist päeva tahad mängida!', 'Choose which day you want to play!'],
  'hub.pets': ['Kas tahad uut sõpra?', 'Do you want a new friend?'],
  'hub.mirror': ['Proovime värve ja mütse!', 'Let us try colours and hats!'],
  'hub.plant': ['Muna on pesas! Soojenda seda.', 'The egg is in the nest! Keep it warm.'],
  'hub.water': ['Muna on soe! Mängi päev ja ta kooreb.', 'Nice and warm! Play a day and it will hatch.'],
  'hub.pick': ['Tere, beebi dino!', 'Hello, baby dino!'],
  'hub.photo': ['Naerata! Teeme pildi!', 'Smile! Let us take a picture!'],
  'hub.photoSaved': ['Pilt on salvestatud!', 'Picture saved!'],

  'mg.ride.name': ['Pterodaktüüli lend', 'Pterodactyl flight'],
  'mg.ride.intro': ['Hoia kinni! Lohista või puuduta, kuhu tahad lennata, ja korja merevaiku.', 'Hold on! Drag or tap where you want to fly, and collect amber gems.'],
  'mg.ride.done': ['Hurraa! Sa lendasid üle terve oru!', 'Hooray! You flew all over the valley!'],
  'mg.dance.name': ['Trampimispidu', 'Stomp party'],
  'mg.dance.intro': ['Vaata, millised jäljed helendavad, ja astu neile samas järjekorras!', 'Watch which footprints glow, then stomp them in the same order!'],
  'mg.dance.watch': ['Vaata ja kuula!', 'Watch and listen!'],
  'mg.dance.turn': ['Nüüd on sinu kord!', 'Now it is your turn!'],
  'mg.dance.again': ['Proovime uuesti! Vaata veel kord.', 'Let us try again! Watch once more.'],
  'mg.dance.good': ['Tubli!', 'Well done!'],
  'mg.dance.done': ['Sa oled suurepärane trampija!', 'You are a super stomper!'],

  nums: [['Üks!', 'Kaks!', 'Kolm!', 'Neli!', 'Viis!', 'Kuus!'], ['One!', 'Two!', 'Three!', 'Four!', 'Five!', 'Six!']],

  // @@DAYS
  // Day 16 · Ice Day
  'd16.name': ['Jääpäev', 'Ice Day'],
  'd16.intro': ['Täna libiseme jääl! Korja viis lumehelvest.', 'Today we glide on the ice! Gather five snowflakes.'],
  'd16.h.flakes': ['Korja viis lumehelvest!', 'Gather five snowflakes!'],
  'd16.h.spin': ['Keera end ringi jää keskel oleval tähel!', 'Spin on the star in the middle of the ice!'],
  'd16.h.friends': ['Võta kolm sõpra kaasa!', 'Take three friends along!'],
  'd16.spin': ['Hurraa, piruett!', 'Hooray, a pirouette!'],
  'd16.friend': ['Aitäh! Libiseme koos!', 'Thanks! Let us glide together!'],
  'd16.done': ['Hurraa! Milline kaunis jääpidu!', 'Hooray! What a beautiful ice party!'],
  'd16.end': ['Sa oled jäälibisemise täht, dino!', 'You are an ice-skating star, dino!'],

  // Day 15 · Camping Day
  'd15.name': ['Telkimispäev', 'Camping Day'],
  'd15.intro': ['Täna telkime! Kõigepealt otsime küttepuid.', 'Today we go camping! First let us look for firewood.'],
  'd15.h.wood': ['Leia neli halgu!', 'Find four pieces of firewood!'],
  'd15.h.fire': ['Süüta lõke!', 'Light the campfire!'],
  'd15.h.marsh': ['Anna igale sõbrale vahukomm!', 'Give every friend a marshmallow!'],
  'd15.needWood': ['Tule jaoks on vaja nelja halgu!', 'We need four pieces of firewood for the fire!'],
  'd15.fire': ['Lõke põleb! Nii soe!', 'The fire is burning! So warm!'],
  'd15.yum': ['Nämm! Aitäh, dino!', 'Yum! Thank you, dino!'],
  'd15.done': ['Hurraa! Kõige hubasem telkimisõhtu!', 'Hooray! The coziest camping evening!'],
  'd15.end': ['Head ööd, dino!', 'Good night, dino!'],

  // Day 14 · Circus Day
  'd14.name': ['Tsirkusepäev', 'Circus Day'],
  'd14.intro': ['Täna on tsirkus! Kõigepealt korjame viis palli.', 'Today is circus day! First let us gather five balls.'],
  'd14.h.balls': ['Korja viis värvilist palli!', 'Gather five coloured balls!'],
  'd14.h.log': ['Kõnni palgil üle laavajõe!', 'Walk across the log over the lava stream!'],
  'd14.h.hoop': ['Aita Trikal läbi tulerõnga hüpata!', 'Help Trixie jump through the fiery hoop!'],
  'd14.logEarly': ['Kõigepealt korjame pallid!', 'First we gather the balls!'],
  'd14.balance': ['Hoia tasakaalu!', 'Keep your balance!'],
  'd14.balanced': ['Tubli! Sa jõudsid üle!', 'Well done! You made it across!'],
  'd14.tri': ['Uuuuh! Vaata, kuidas ma hüppan!', 'Roar! Watch me jump!'],
  'd14.done': ['Hurraa! Milline lõbus tsirkus!', 'Hooray! What a fun circus!'],
  'd14.end': ['Sa oled tsirkusetäht, dino!', 'You are a circus star, dino!'],

  // Day 13 · Band Day
  'd13.name': ['Bändipäev', 'Band Day'],
  'd13.intro': ['Täna on kontsert! Leiame kõigepealt kolm pilli.', 'Today there is a concert! First let us find three instruments.'],
  'd13.h.items': ['Leia trumm, pasun ja kõristi!', 'Find the drum, the horn and the shaker!'],
  'd13.h.beat': ['Trampi helendavatele trummidele!', 'Stomp on the glowing drums!'],
  'd13.h.show': ['Mine lavale ja mängi!', 'Go on stage and play!'],
  'd13.found': ['Leidsid pilli!', 'You found an instrument!'],
  poses: [['Ilus!', 'Imeline!', 'Suurepärane!'], ['Lovely!', 'Wonderful!', 'Magnificent!']],
  'd13.applause': ['Kõik plaksutavad!', 'Everybody is clapping!'],
  'd13.done': ['Braavo! Milline vahva kontsert!', 'Bravo! What a great concert!'],
  'd13.end': ['Sa oled päris rokkstaar, dino!', 'You are a real rock star, dino!'],

  // Day 12 · Farm Day
  'd12.name': ['Talupäev', 'Farm Day'],
  'd12.intro': ['Tere hommikust talus! Vanaema Bronto on näljane. Korjame talle lehti!', 'Good morning on the farm! Grandma Bronto is hungry. Let us pick leaves for her!'],
  'd12.h.leaves': ['Korja neli kimpu lehti puudelt!', 'Pick four bunches of leaves from the trees!'],
  'd12.h.feed': ['Toida näljast pika kaelaga dinot!', 'Feed the hungry long-neck!'],
  'd12.h.babies': ['Kutsu kolm beebit endaga kaasa!', 'Call three babies to follow you!'],
  'd12.h.pen': ['Vii beebid aedikusse!', 'Take the babies to their pen!'],
  'd12.hungry': ['Mul on kõht tühi! Korja mulle lehti!', 'I am so hungry! Please pick me some leaves!'],
  'd12.feed': ['Nämm, nämm, nämm!', 'Yum, yum, yum!'],
  'd12.fed': ['Aitäh! Nüüd olen täis!', 'Thank you! Now I am full!'],
  'd12.baby': ['Piip! Tulen sinuga!', 'Peep! I will follow you!'],
  'd12.notYet': ['Veel mitte! Kõigepealt on vaja kolme beebit.', 'Not yet! First we need three babies.'],
  'd12.penDone': ['Beebid on aedikus ja jäävad magama!', 'The babies are in their pen and falling asleep!'],
  'd12.done': ['Hurraa! Kõik on söönud ja turvaliselt kodus!', 'Hooray! Everyone is fed and safe at home!'],
  'd12.end': ['Sa oled parim lastehoidja!', 'You are the best nursery helper!'],

  // Day 11 · Sea Floor Day
  'd11.name': ['Merepõhi', 'Sea Floor'],
  'd11.intro': ['Täna sukeldume merre! Kõigepealt otsime kolm karpi.', 'Today we dive into the sea! First we look for three clams.'],
  'd11.h.pearls': ['Ava kolm karpi ja leia pärlid!', 'Open three clams and find the pearls!'],
  'd11.h.friends': ['Tee sõbraks kolm mereloomakest!', 'Make friends with three sea animals!'],
  'd11.h.chest': ['Ava aardekirst!', 'Open the treasure chest!'],
  'd11.friend': ['Tere! Tulen sinuga kaasa!', 'Hello! I will come along with you!'],
  'd11.locked': ['Kirst on lukus! Leia kõigepealt pärlid ja sõbrad.', 'The chest is locked! First find the pearls and friends.'],
  'd11.opened': ['Vaata, kui palju aaret!', 'Look at all the treasure!'],
  'd11.end': ['Sa oled merekangelane!', 'You are a sea hero!'],

  // Day 10 · Waterhole Day
  'd10.name': ['Ujumispäev', 'Waterhole Day'],
  'd10.intro': ['Täna on kuum! Leiame neli ujumismänguasja ja läheme vette.', 'It is hot today! Let us find four floaty toys and jump in the water.'],
  'd10.h.toys': ['Leia neli ujumismänguasja!', 'Find four floaty toys!'],
  'd10.h.splash': ['Puuduta vett ja hüppa sisse!', 'Tap the water and jump in!'],
  'd10.h.drinks': ['Anna igale sõbrale jook!', 'Give every friend a drink!'],
  'd10.toysFirst': ['Kõigepealt leiame mänguasjad!', 'First let us find the toys!'],
  'd10.look': ['Kõigil on janu! Vaata, mida iga sõber tahab.', 'Everyone is thirsty! Look what each friend wants.'],
  'd10.no': ['Ei, aitäh! {name} tahaks {want}.', 'No, thank you! {name} would like {want}.'],
  'd10.done': ['Hurraa! Kõik hüppavad korraga vette!', 'Hooray! Everyone jumps in together!'],
  'd10.end': ['Milline lõbus veepäev!', 'What a fun day at the waterhole!'],
  splashes: [['Plartsh!', 'Veel üks hüpe!', 'Hurraa, plartsh!'], ['Splash!', 'One more jump!', 'Hooray, splash!']],
  'drink.coconut': ['kookospähklit', 'a coconut'],
  'drink.watermelon': ['arbuusi', 'watermelon'],
  'drink.juice': ['mahla', 'juice'],

  // Day 9 · Snow Day
  'd9.name': ['Lumepäev', 'Snow Day'],
  'd9.intro': ['Sadas lund! Veereta kolm lumepalli ja ehita lumedino.', 'It has snowed! Roll up three snowballs and build a snow dino.'],
  'd9.h.balls': ['Veereta kolm lumepalli!', 'Roll up three snowballs!'],
  'd9.h.dress': ['Pane lumedinole sall, müts ja silmad!', 'Give the snow dino a scarf, a hat and eyes!'],
  'd9.h.gifts': ['Vii kingitused kolmele külmetavale sõbrale!', 'Take presents to three shivering friends!'],
  'd9.dino.build': ['Siia tuleb lumedino! Veereta kõigepealt lumepalle.', 'The snow dino goes here! First roll some snowballs.'],
  'd9.needDino': ['Kõigepealt ehitame lumedino valmis!', 'First let us finish building the snow dino!'],
  'd9.thanks': ['Aitäh! Nüüd on mul soe!', 'Thank you! Now I am warm!'],
  'd9.done': ['Hurraa! Sa ehitasid kõige armsama lumedino!', 'Hooray! You built the cutest snow dino!'],
  'd9.end': ['Kõik on soojad ja õnnelikud!', 'Everyone is warm and happy!'],

  // Day 8 · Jungle Run
  'd8.name': ['Džunglijooks', 'Jungle Run'],
  'd8.intro': ['Täna jookseme džunglis! Leia kolm merevaigukivi, et suur kivi eest ära veeretada.', 'Today we run through the jungle! Find three amber stones to roll the big boulder away.'],
  'd8.h.amber': ['Leia kolm merevaigukivi!', 'Find three amber stones!'],
  'd8.h.gate': ['Veereta suur kivi eest ära!', 'Roll the big boulder away!'],
  'd8.h.run': ['Jookse päikeselisse pessa!', 'Run to the sunny nest!'],
  'd8.foundAmber': ['Leidsid merevaigu!', 'You found amber!'],
  'd8.gateNeeds': ['Selle kivi jaoks on vaja kolme merevaigukivi!', 'We need three amber stones for this boulder!'],
  'd8.gateOpen': ['Kivi veereb eest! Jookse!', 'The boulder rolls away! Run!'],
  'd8.bump1': ['Hihii! Raptu tahab sind kallistada!', 'Hee hee! Rapto wants to hug you!'],
  'd8.bump2': ['Püüdsid kinni! Aga ta tahab ainult mängida!', 'Tag! But he only wants to play!'],
  'd8.bump3': ['Ära karda, ta on sõbralik!', 'Do not be scared, he is friendly!'],
  'd8.escaped': ['Hurraa! Sa jõudsid päikese kätte!', 'Hooray! You made it to the sunshine!'],
  'd8.end': ['Kõik raptorid on sinu sõbrad!', 'All the raptors are your friends!'],

  // Day 7 · Birthday
  'd7.name': ['Sünnipäev', 'Birthday'],
  'd7.intro': ['Täna on Bronto sünnipäev! Kõigepealt kaunistame õhupallidega.', 'Today is Bronto\'s birthday! First we decorate with balloons.'],
  'd7.h.balloons': ['Võta viis õhupalli!', 'Take five balloons!'],
  'd7.h.presents': ['Leia kolm kingitust!', 'Find three presents!'],
  'd7.h.candles': ['Süüta tordil küünlad!', 'Light the candles on the cake!'],
  'd7.h.song': ['Laulame sünnipäevalaulu!', 'Let us sing the birthday song!'],
  'd7.foundPresent': ['Leidsid kingituse!', 'You found a present!'],
  'd7.candle': ['Küünal põleb!', 'The candle is lit!'],
  'd7.honoree': ['Aitäh, dino! See on mu parim sünnipäev!', 'Thank you, dino! This is my best birthday!'],
  'd7.notYet': ['Veel mitte! Teeme kõigepealt ettevalmistused.', 'Not yet! Let us get everything ready first.'],
  'd7.wish': ['Pane soov ja puhu küünlad ära!', 'Make a wish and blow out the candles!'],
  'd7.done': ['Palju õnne sünnipäevaks, Bronto!', 'Happy birthday, Bronto!'],
  'd7.end': ['Kõige parem sünnipäev!', 'What a wonderful birthday!'],

  // Day 6 · Fossil Day
  'd6.name': ['Fossiilipäev', 'Fossil Day'],
  'd6.intro': ['Täna otsime luid! Kaevame kõigepealt kolm liivakünkat.', 'Today we look for bones! First we dig up three sand mounds.'],
  'd6.h.dig': ['Puuduta kolme künka, et kaevata!', 'Tap three mounds to dig!'],
  'd6.h.brush': ['Puhasta kolm luud harjaga!', 'Brush the three bones clean!'],
  'd6.h.build': ['Pane luustik kokku!', 'Put the skeleton together!'],
  'd6.standEarly': ['Veel mitte! Kõigepealt kaevame ja puhastame luud.', 'Not yet! First we dig and clean the bones.'],
  'd6.built': ['Vaata! Hiiglasuur dinosaurus!', 'Look! A giant dinosaur!'],
  'd6.end': ['Sa oled suurepärane luude leidja!', 'You are a super fossil finder!'],

  // names of the friends
  'animal.tri': ['Trika', 'Trixie'],
  'animal.steg': ['Stego', 'Stego'],
  'animal.raptor': ['Raptu', 'Rapto'],
  'animal.anky': ['Anki', 'Anky'],
  'animal.para': ['Para', 'Para'],
  'animal.spino': ['Spino', 'Spino'],
  'animal.pachy': ['Pung', 'Bonk'],
  'treat.fern': ['sõnajalga', 'ferns'],
  'treat.berry': ['marju', 'berries'],
  'treat.fish': ['kala', 'fish'],

  // Day 4 · Picnic Day
  'd4.name': ['Piknikupäev', 'Picnic Day'],
  'd4.intro': ['Täna on suur piknik! Kutsume kolm sõpra. Puuduta sõpra, et talle tere öelda!', 'Today is a big picnic! Let us invite three friends. Tap a friend to say hello!'],
  'd4.h.invite': ['Kutsu kolm sõpra piknikule!', 'Invite three friends to the picnic!'],
  'd4.h.seat': ['Vii sõbrad tekile!', 'Take the friends to the blanket!'],
  'd4.h.serve': ['Anna igale sõbrale tema lemmiksöök!', 'Give each friend the food they like!'],
  'd4.yes': ['{name} ütleb jah! Piknik kõlab suurepäraselt!', '{name} says yes! A picnic sounds great!'],
  'd4.mama': ['Tere, väike! Palun too mulle kolm sõpra piknikule!', 'Hello, little one! Please bring three friends to the picnic!'],
  'd4.look': ['Kõik on kohal! Vaata, mida iga sõber tahaks.', 'Everyone is here! Look what each friend would like.'],
  'd4.pickFirst': ['Vali kõigepealt salvest söök!', 'First pick some food from the tray!'],
  'd4.no': ['Ei, aitäh! {name} sooviks {want}.', 'No, thank you! {name} would like {want}.'],
  'd4.yum': ['Nämm! {name} on väga rõõmus!', 'Yum! {name} is very happy!'],
  'd4.cheer': ['Hurraa! Kõige parem piknik!', 'Hooray! The best picnic ever!'],
  'd4.end': ['Kõigil oli imeline aeg, dino!', 'Everyone had a wonderful time, dino!'],

  // Day 5 · Volcano Party
  'd5.name': ['Tulemäe pidu', 'Volcano Party'],
  'd5.intro': ['Täna õhtul on pidu tulemäe all! Kõigepealt süütame kolm tõrvikut.', 'Tonight there is a party under the volcano! First we light three torches.'],
  'd5.h.light': ['Süüta kolm tõrvikut!', 'Light three torches!'],
  'd5.h.invite': ['Kutsu oma neli sõpra pidutsema!', 'Invite your four friends to the party!'],
  'd5.h.stomp': ['Trampi helendavatele jälgedele!', 'Stomp on the glowing footprints!'],
  'd5.hello.raptor': ['Raptu on peoks valmis!', 'Rapto is ready to party!'],
  'd5.hello.anky': ['Anki armastab trampida!', 'Anky loves to stomp!'],
  'd5.hello.para': ['Para tuleb ka ja puhub pasunat!', 'Para is coming and plays the horn!'],
  'd5.hello.spino': ['Spino hõikab hurraa!', 'Spino shouts hooray!'],
  'd5.done': ['Hurraa! Tulemägi purskab ilutulestikku! Sa oled parim peoloom!', 'Hooray! The volcano is making fireworks! You are the best party animal!'],
  'd5.end': ['Milline suurepärane pidu!', 'What a great party!'],

  // Day 3 · Stew Day
  'd3.name': ['Supipäev', 'Stew Day'],
  'd3.intro': ['Täna keedame suure supi! Kõigepealt leiame sõnajala, marja ja seene.', 'Today we cook a big stew! First we find a fern, a berry and a mushroom.'],
  'd3.h.gather': ['Leia sõnajalg, mari ja seen!', 'Find a fern, a berry and a mushroom!'],
  'd3.h.mix': ['Puuduta potti ja sega!', 'Tap the pot and stir!'],
  'd3.h.cook': ['Pane pott tulele!', 'Put the pot on the fire!'],
  'd3.h.serve': ['Täida kõik kuus kaussi!', 'Fill all six bowls!'],
  'd3.found': ['Leidsid {x}!', 'You found {x}!'],
  'd3.i.fern': ['sõnajala', 'a fern'],
  'd3.i.berry': ['marja', 'a berry'],
  'd3.i.mushroom': ['seene', 'a mushroom'],
  'd3.needFirst': ['Kõigepealt on vaja sõnajalga, marja ja seent!', 'First we need a fern, a berry and a mushroom!'],
  stirs: [['Sega!', 'Sega, sega!', 'Ringiratast!', 'Peaaegu!', 'Nämm!'], ['Stir!', 'Stir, stir!', 'Round and round!', 'Almost!', 'Yum!']],
  'd3.stir': ['Sega!', 'Stir!'],
  'd3.cookEarly': ['Veel mitte! Kõigepealt sega supp.', 'Not yet! First stir the stew.'],
  'd3.alreadyCooked': ['Supp on juba valmis!', 'The stew is already cooked!'],
  'd3.ontoFire': ['Pott läheb tulele!', 'The pot goes on the fire!'],
  'd3.ding': ['Supp on valmis!', 'The stew is ready!'],
  'd3.tapEach': ['Puuduta iga kaussi, et seda täita!', 'Tap each bowl to fill it!'],
  'd3.yummy': ['Nämm! Mis hea supp!', 'Yum! What a tasty stew!'],
  'd3.end': ['Sa keetsid kuus kaussi suppi, dino!', 'You cooked six bowls of stew, dino!'],

  // Day 2 · Wake-up Day
  'd2.name': ['Ärkamispäev', 'Wake-up Day'],
  'd2.intro': ['Tere hommikust, dino! Koopas on kõik veel unised. Vali kõigepealt endale värv ja müts!', 'Good morning, dino! Everyone in the cave is still sleepy. First pick your colour and hat!'],
  'd2.h.look': ['Mine veelombi juurde ja vali värv ja müts!', 'Go to the puddle and pick your colour and hat!'],
  'd2.h.wake': ['Ärata oma kolm unist sõpra!', 'Wake your three sleepy friends!'],
  'd2.h.door': ['Nüüd mine välja päikese kätte!', 'Now go out into the sunshine!'],
  'd2.greet.tri': ['Tere hommikust, Trika!', 'Good morning, Trixie!'],
  'd2.greet.steg': ['Tere hommikust, Stego!', 'Good morning, Stego!'],
  'd2.greet.pachy': ['Tere hommikust, Pung!', 'Good morning, Bonk!'],
  'd2.notYet': ['Kõigepealt teeme end valmis!', 'First let us get ready!'],
  'd2.parade': ['Milline kaunis hommik! Lähme paraadile!', 'What a beautiful morning! Let us parade!'],
  'd2.end': ['Sa näed vahva välja, dino! Milline tore hommik!', 'You look great, little dino! What a lovely morning!'],

  // Day 1 · Egg Day
  'd1.name': ['Munapäev', 'Egg Day'],
  'd1.intro': ['Tere hommikust, väike dino! Mama Bronto kaotas kolm muna. Kas aitad neid leida?', 'Good morning, little dino! Mama Bronto has lost three eggs. Can you help find them?'],
  'd1.h.eggs': ['Leia kolm kadunud muna!', 'Find the three lost eggs!'],
  'd1.h.nest': ['Vii munad pessa!', 'Take the eggs to the nest!'],
  'd1.h.hatch': ['Puuduta mune, et need kooruksid!', 'Tap the eggs so they hatch!'],
  'd1.mama.eggs': ['Tere, väike! Palun leia mu kolm muna!', 'Hello, little one! Please find my three eggs!'],
  'd1.mama.nest': ['Aitäh! Vii nad nüüd pessa!', 'Thank you! Now take them to the nest!'],
  'd1.needEggs': ['Pesa jaoks on vaja kolme muna!', 'We need three eggs for the nest!'],
  'd1.warm': ['Munad on soojas pesas!', 'The eggs are warm in the nest!'],
  'd1.crack': ['Krõks! Mis seal sees on?', 'Crack! What is inside?'],
  'd1.hellos': [['Piip! Tere!', 'Tere, väike!', 'Hurraa, beebi!'], ['Peep! Hello!', 'Hello, little one!', 'Hooray, a baby!']],
  'd1.done': ['Hurraa! Kolm uut beebit!', 'Hooray! Three new babies!'],
  'd1.end': ['Tubli, dino! Mama Bronto on nii õnnelik!', 'Well done, dino! Mama Bronto is so happy!'],
  'd2.looks': ['Sa näed vahva välja, dino!', 'You look great, little dino!'],

};

const STR = { et: {}, en: {} };
for (const [k, [et, en]] of Object.entries(L)) {
  STR.et[k] = et;
  STR.en[k] = en;
}
export const STRINGS = STR;

function pickLang() {
  const q = new URLSearchParams(location.search).get('lang');
  if (q && STR[q]) {
    try {
      localStorage.setItem('dinoDay.lang', q);
    } catch {
      /* storage blocked: the choice just lasts for this visit */
    }
    return q;
  }
  try {
    const saved = localStorage.getItem('dinoDay.lang');
    if (saved && STR[saved]) return saved;
  } catch {
    /* ignore */
  }
  return 'et';
}

export const lang = pickLang();

export function setLang(l) {
  try {
    localStorage.setItem('dinoDay.lang', l);
  } catch {
    /* ignore */
  }
  const u = new URL(location.href);
  u.searchParams.delete('lang');
  location.href = u.toString();
}

// t('ui.day', { n: 3 }) -> 'Päev 3'
export function t(key, vars) {
  const v = STR[lang][key] ?? STR.en[key] ?? key;
  if (typeof v !== 'string' || !vars) return v;
  return v.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`));
}

// fill the fixed text in index.html
export function applyStatic() {
  document.documentElement.lang = lang;
  document.title = t('ui.title');
  document.querySelectorAll('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
}
