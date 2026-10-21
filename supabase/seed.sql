insert into public.genres(name,slug) values ('Rock','rock'),('Glam rock','glam-rock'),('Hard rock','hard-rock'),('Thrash metal','thrash-metal'),('Rock en español','rock-en-espanol'),('New wave','new-wave'),('Post punk','post-punk'),('Rock alternativo','alternative-rock'),('Rock gótico','gothic-rock'),('Synth pop','synth-pop'),('Pop rock','pop-rock'),('Rock progresivo','progressive-rock'),('Rock psicodélico','psychedelic-rock'),('Grunge','grunge'),('Nu metal','nu-metal'),('Funk rock','funk-rock'),('Punk rock','punk-rock'),('Heavy metal','heavy-metal'),('Country rock','country-rock'),('Britpop','britpop'),('Indie rock','indie-rock'),('Disco','disco'),('Metal alternativo','alternative-metal'),('Glam metal','glam-metal'),('Roots rock','roots-rock') on conflict do nothing;

with seed(name,slug,year,country,city,lng,lat,summary) as (values
('The Beatles','the-beatles',1960,'GB','Liverpool',-2.9916,53.4084,'Liverpool transformó la música popular con canciones, estudio e imaginación.'),
('Queen','queen',1970,'GB','London',-0.1276,51.5072,'Teatralidad y armonías que ampliaron los límites del rock.'),
('The Rolling Stones','the-rolling-stones',1962,'GB','London',-0.1276,51.5072,'Blues, actitud y una carrera esencial para la historia del rock.'),
('Pink Floyd','pink-floyd',1965,'GB','London',-0.1276,51.5072,'Experimentación sonora y discos conceptuales de alcance universal.'),
('Led Zeppelin','led-zeppelin',1968,'GB','London',-0.1276,51.5072,'Blues pesado, virtuosismo y una nueva escala para el rock.'),
('Guns N'' Roses','guns-n-roses',1985,'US','Los Angeles',-118.2437,34.0522,'La energía de Sunset Strip transformó el hard rock.'),
('Metallica','metallica',1981,'US','Los Angeles',-118.2437,34.0522,'Velocidad, precisión y una nueva escala para el metal.'),
('Bon Jovi','bon-jovi',1983,'US','Sayreville',-74.3607,40.4593,'Himnos de estadio surgidos en Nueva Jersey.'),
('Soda Stereo','soda-stereo',1982,'AR','Buenos Aires',-58.3816,-34.6037,'El rock latino adquirió una dimensión continental.'),
('Caifanes','caifanes',1987,'MX','Ciudad de México',-99.1332,19.4326,'Post punk, identidad mexicana y raíces latinoamericanas.'),
('AC/DC','ac-dc',1973,'AU','Sydney',151.2093,-33.8688,'Riffs directos y una potencia inconfundible.'),
('U2','u2',1976,'IE','Dublin',-6.2603,53.3498,'Una banda de Dublín con un sonido de alcance global.'),
('Nirvana','nirvana',1987,'US','Aberdeen',-123.8157,46.9754,'Desde Aberdeen, el grunge cambió el pulso del rock mundial.'),
('Coldplay','coldplay',1997,'GB','London',-0.1276,51.5072,'Melodías expansivas surgidas de la escena londinense.'),
('Linkin Park','linkin-park',1996,'US','Agoura Hills',-118.7743,34.1364,'Rock, electrónica y rap unidos para una nueva generación.'),
('Red Hot Chili Peppers','red-hot-chili-peppers',1983,'US','Los Angeles',-118.2437,34.0522,'Funk y rock moldeados por la energía de Los Ángeles.'),
('Aerosmith','aerosmith',1970,'US','Boston',-71.0589,42.3601,'El rock de Boston encontró una voz áspera y duradera.'),
('The Who','the-who',1964,'GB','London',-0.1276,51.5072,'Potencia escénica y ambición narrativa desde Londres.'),
('Radiohead','radiohead',1985,'GB','Abingdon',-1.2828,51.6708,'Inquietud artística y reinvención constante desde Oxfordshire.'),
('Green Day','green-day',1987,'US','Berkeley',-122.2727,37.8715,'El punk de East Bay llegó a una audiencia mundial.'),
('Foo Fighters','foo-fighters',1994,'US','Seattle',-122.3321,47.6062,'Guitarras y resistencia nacidas después de la era grunge.'),
('Iron Maiden','iron-maiden',1975,'GB','London',-0.1276,51.5072,'Narrativa, velocidad y una identidad central del heavy metal.'),
('Black Sabbath','black-sabbath',1968,'GB','Birmingham',-1.8904,52.4862,'El sonido industrial de Birmingham ayudó a crear el heavy metal.'),
('Deep Purple','deep-purple',1968,'GB','Hertford',-0.0786,51.7959,'Virtuosismo y volumen en los cimientos del hard rock.'),
('Kiss','kiss',1973,'US','New York',-74.006,40.7128,'Espectáculo, maquillaje y rock de estadio desde Nueva York.'),
('Journey','journey',1973,'US','San Francisco',-122.4194,37.7749,'Melodías de gran formato nacidas en San Francisco.'),
('Pearl Jam','pearl-jam',1990,'US','Seattle',-122.3321,47.6062,'Una voz persistente de la explosión musical de Seattle.'),
('The Eagles','the-eagles',1971,'US','Los Angeles',-118.2437,34.0522,'Armonías californianas y canciones de carretera.'),
('Fleetwood Mac','fleetwood-mac',1967,'GB','London',-0.1276,51.5072,'Del blues británico a una obra pop de enorme influencia.'),
('Oasis','oasis',1991,'GB','Manchester',-2.2426,53.4808,'Manchester recuperó la escala épica de la canción británica.'),
('R.E.M.','rem',1980,'US','Athens',-83.3576,33.9519,'La escena universitaria de Athens abrió camino al rock alternativo.'),
('Imagine Dragons','imagine-dragons',2008,'US','Las Vegas',-115.1398,36.1699,'Percusión y estribillos masivos desde Las Vegas.'),
('Maroon 5','maroon-5',1994,'US','Los Angeles',-118.2437,34.0522,'Pop y funk convertidos en éxitos internacionales.'),
('Arctic Monkeys','arctic-monkeys',2002,'GB','Sheffield',-1.4701,53.3811,'Crónicas urbanas y guitarras surgidas en Sheffield.'),
('Muse','muse',1994,'GB','Teignmouth',-3.4967,50.5469,'Dramatismo, electrónica y rock de gran escala.'),
('The Cure','the-cure',1978,'GB','Crawley',-0.1872,51.1091,'Melancolía, textura y canciones que cruzaron géneros.'),
('Depeche Mode','depeche-mode',1980,'GB','Basildon',0.4615,51.5761,'Sintetizadores y música popular de pulso oscuro.'),
('Blur','blur',1988,'GB','London',-0.1276,51.5072,'Observación británica, pop inquieto y reinvención musical.'),
('ABBA','abba',1972,'SE','Stockholm',18.0686,59.3293,'Composición precisa y armonías que llevaron Suecia al mundo.'),
('Bee Gees','bee-gees',1958,'AU','Redcliffe',153.1094,-27.2302,'Armonías familiares que atravesaron décadas y estilos.'),
('Scorpions','scorpions',1965,'DE','Hannover',9.732,52.3759,'Hard rock alemán con alcance mundial.'),
('Evanescence','evanescence',1995,'US','Little Rock',-92.2896,34.7465,'Piano, metal y una voz distintiva desde Arkansas.'),
('System of a Down','system-of-a-down',1994,'US','Glendale',-118.2551,34.1425,'Ritmos extremos y conciencia política desde California.'),
('Twenty One Pilots','twenty-one-pilots',2009,'US','Columbus',-82.9988,39.9612,'Una mezcla flexible de rock, rap y electrónica.'),
('Paramore','paramore',2004,'US','Franklin',-86.8689,35.9251,'Energía punk y melodía desde Tennessee.'),
('Mötley Crüe','motley-crue',1981,'US','Los Angeles',-118.2437,34.0522,'Exceso y glam metal desde Sunset Strip.'),
('The Doors','the-doors',1965,'US','Los Angeles',-118.2437,34.0522,'Poesía y psicodelia en el corazón de Los Ángeles.'),
('Creedence Clearwater Revival','creedence-clearwater-revival',1967,'US','El Cerrito',-122.3108,37.9158,'Rock de raíces y relatos de una América imaginada.'),
('Van Halen','van-halen',1972,'US','Pasadena',-118.1445,34.1478,'Una guitarra revolucionaria y energía californiana.'),
('Def Leppard','def-leppard',1976,'GB','Sheffield',-1.4701,53.3811,'Producción monumental y rock melódico desde Sheffield.'),
('The Police','the-police',1977,'GB','London',-0.1276,51.5072,'Reggae, punk y pop unidos por tres músicos en Londres.'),
('Genesis','genesis',1967,'GB','Godalming',-0.617,51.1858,'Del rock progresivo al pop sofisticado.'),
('Héroes del Silencio','heroes-del-silencio',1984,'ES','Zaragoza',-0.8891,41.6488,'Una voz esencial del rock en español.'),
('Maná','mana',1986,'MX','Guadalajara',-103.3496,20.6597,'Rock mexicano proyectado a todo el continente.')),
inserted_bands as (
 insert into public.bands(name,slug,formed_year,country_code,summary,biography,published)
 select name,slug,year,country,summary,summary,true from seed on conflict(slug) do update set name=excluded.name, formed_year=excluded.formed_year, country_code=excluded.country_code, summary=excluded.summary, biography=excluded.biography, published=true returning id,slug
), inserted_places as (
 insert into public.places(name,city,country_code,kind,location,description,website_url)
 select name || ' · origen',city,country,'birthplace',extensions.st_setsrid(extensions.st_makepoint(lng,lat),4326)::extensions.geography,summary,'https://www.openstreetmap.org/' from seed
 where not exists (select 1 from public.places p where p.name = seed.name || ' · origen') returning id,name
), all_places as (
 select p.id,p.name from public.places p where p.name in (select name || ' · origen' from seed)
)
insert into public.band_places(band_id,place_id,relationship)
select b.id,p.id,'origin' from inserted_bands b join all_places p on p.name = (select name || ' · origen' from seed where slug=b.slug) on conflict do nothing;

insert into public.band_genres(band_id,genre_id)
select b.id,g.id from public.bands b cross join public.genres g
where g.slug = 'rock' and b.slug in (
 'the-beatles','queen','the-rolling-stones','pink-floyd','led-zeppelin','metallica','u2','ac-dc','guns-n-roses','nirvana','coldplay','linkin-park','red-hot-chili-peppers','bon-jovi','aerosmith','the-who','radiohead','green-day','foo-fighters','iron-maiden','black-sabbath','deep-purple','kiss','journey','pearl-jam','the-eagles','fleetwood-mac','oasis','rem','imagine-dragons','maroon-5','arctic-monkeys','muse','the-cure','depeche-mode','blur','abba','bee-gees','scorpions','evanescence','system-of-a-down','twenty-one-pilots','paramore','motley-crue','the-doors','creedence-clearwater-revival','van-halen','def-leppard','the-police','genesis','soda-stereo','caifanes','heroes-del-silencio','mana'
) on conflict do nothing;

-- Run in a separate statement so PostgreSQL can see places inserted above.
insert into public.band_places (band_id, place_id, relationship)
select b.id, p.id, 'origin'
from public.bands b
join public.places p on p.name = b.name || ' · origen'
where b.published
on conflict do nothing;
