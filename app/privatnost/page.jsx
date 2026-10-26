import { stranica } from "@/lib/seo";
import { PravnaStranica, Odjeljak, Popis, VODITELJ } from "../pravno";

export const metadata = stranica({
  naslov: "Pravila privatnosti · LAKAT",
  opis: "Kako LAKAT čuva tvoje podatke: tko vidi tvoje runde i lokaciju, što spremamo, kome to šaljemo i kako obrisati račun.",
  put: "/privatnost",
});

// GDPR čl. 13 + Apple 5.1.1(i). Činjenice su iz koda (inventura 3.10.2026.):
// kad se promijeni tko dobiva podatke, mijenja se i ovo. Tekst pregledavaju
// Petar i Claude (artifact pravno/), ne pravnik.
export default function PrivatnostPage() {
  return (
    <PravnaStranica
      naslov="Pravila privatnosti"
      verzija="Verzija 5 · studeni 2026. (lokacija za javne runde, prijava s Appleom, ekipe, komentari, Možda poznaješ, bez anketa)"
      sazetak={[
        "Tvoje runde, slike i lokaciju vide samo tvoji prihvaćeni pajdaši. Iznimka je runda koju sam staviš „Javno u blizini”.",
        "Ne prodajemo ti podatke. Nema reklama, nema praćenja po drugim appovima.",
        "Lokaciju šaljemo kad objaviš rundu ili upališ „Vani sam”. Dok je app otvoren, svake 2 minute šalje i lokaciju zaokruženu na oko 100 m, da ti pokaže javne runde u blizini. Tu lokaciju ne spremamo.",
        "Račun obrišeš kad hoćeš, u Profilu. S njim ide sve tvoje.",
        `Pitanja i zahtjevi: ${VODITELJ.mail}.`,
      ]}
    >
      <Odjeljak broj="1" naslov="Tko obrađuje tvoje podatke">
        <p>
          Voditelj obrade je {VODITELJ.ime}, {VODITELJ.adresa}, e-mail{" "}
          <a className="text-accent underline underline-offset-4" href={`mailto:${VODITELJ.mail}`}>{VODITELJ.mail}</a>.
          LAKAT nema službenika za zaštitu podataka jer ga zakon za ovu vrstu i veličinu obrade ne traži.
        </p>
      </Odjeljak>

      <Odjeljak broj="2" naslov="Koje podatke i zašto">
        <Popis
          stavke={[
            <>
              <b>Račun</b>: e-mail, lozinka (ne spremamo je u čitljivom obliku), ime, username i profilna. Bez toga nema
              računa (čl. 6. st. 1. t. b GDPR-a, izvršenje ugovora). Pri registraciji te pitamo i kako si čuo za LAKAT;
              odgovor služi samo da znamo što radi (t. f). Ako se prijaviš s Appleom, Apple nam da oznaku tvog Apple
              računa i e-mail (može biti Appleova skrivena adresa), a ime samo ako ga sam podijeliš. Čuvamo i Appleov
              token za tu prijavu, samo da je pri brisanju računa opozovemo.
            </>,
            <>
              <b>Runde</b>: fotke i video koje snimiš, tekst i naljepnice na njima, piće koje odabereš, vrijeme i
              lokacija na kojoj je runda objavljena. To je sama svrha appa (t. b).
            </>,
            <>
              <b>„Vani sam”</b>: lokacija u trenutku kad ga upališ. Ako dopustiš lokaciju „Uvijek”, telefon sam
              pazi kad se udaljiš 300 m i tad ga ugasi; lokacija se pritom ne šalje. Dopuštenje možeš povući u
              postavkama telefona (čl. 6. st. 1. t. a, privola).
            </>,
            <>
              <b>Javne runde u blizini</b>: dok je app otvoren i dopustio si lokaciju, mobitel svake 2 minute pošalje
              lokaciju zaokruženu na oko 100 m, da ti pokažemo javne runde u krugu od oko 1 km. Ne spremamo je u bazu
              i nitko je ne vidi. Ako to ne želiš, isključi lokaciju za LAKAT u postavkama telefona (t. b).
            </>,
            <>
              <b>Kadar</b>: kad je pajdaš istog dana objavio rundu unutar oko 100 m od tvoje, poslužitelj vas označi
              zajedno („u kadru”) i javi to pajdašima (t. b).
            </>,
            <>
              <b>Druženje</b>: pajdaši, zahtjevi, komentari, reakcije, pozivi na laktanje, ekipe, aura i rezultati
              igara (t. b).
            </>,
            <>
              <b>Prijave i blokade</b>: tko je koga prijavio ili blokirao, razlog i napomena. Treba za sigurnost
              korisnika i za odgovor na prijavu (čl. 6. st. 1. t. f, legitimni interes).
            </>,
            <>
              <b>Filter teksta</b>: komentari, username i tekst na fotki prolaze automatsku provjeru mržnje i
              prijetnji na našem poslužitelju. Tekst se ne šalje nikome drugome (t. f).
            </>,
            <>
              <b>Obavijesti</b>: ako ih dopustiš na webu, preglednik nam da adresu za slanje obavijesti; na iPhoneu
              Apple nam da oznaku uređaja (token) za slanje. Spremamo je uz tvoj račun samo za obavijesti. Odvežemo je
              od računa kad se odjaviš, a brišemo kad obavijesti odbiješ ili obrišeš račun (t. b).
            </>,
            <>
              <b>Web</b>: na laktarenje.com Vercel Analytics broji posjete stranicama, bez kolačića i bez
              praćenja po drugim stranicama (t. f).
            </>,
          ]}
        />
        <p>Fotke se ne šalju nikakvoj umjetnoj inteligenciji.</p>
      </Odjeljak>

      <Odjeljak broj="3" naslov="Tko vidi što">
        <Popis
          stavke={[
            "Runde, slike, pića, lokaciju i „Vani sam” vide samo tvoji pajdaši: ljudi čiji si zahtjev prihvatio ili koji su u appu potvrdili tvoj pozivni link (jedan link vrijedi za najviše 20 ljudi). Pajdaša možeš maknuti kad hoćeš. To provodi baza, ne samo app.",
            "Komentare i reakcije na pajdaševoj rundi vide svi njegovi pajdaši. Zato tvoj komentar, username i profilnu ispod njegove runde mogu vidjeti i ljudi koji nisu tvoji pajdaši.",
            "Javnu rundu („Javno u blizini”, ugašeno dok ga sam ne upališ) 24 sata vide ljudi s LAKTOM u krugu od oko 1 km: fotku, tvoj username i profilnu. Mjesto vide zaokruženo na oko 100 m. Krug se računa iz lokacije koju javi njihov mobitel, pa javnu rundu smatraj javnom. Tko je s tobom u blokadi, ne vidi je.",
            "„Možda poznaješ”: pajdašima tvojih pajdaša možemo te predložiti. Vide tvoj username, profilnu i imena do dvoje vaših zajedničkih pajdaša. Isključiš to u Profilu.",
            "Ekipa: ime, grb, ligu, broj izlazaka ekipe i kvartove koje drži vide svi s LAKTOM. Tko je u ekipi, vide samo njezini članovi. Oni međusobno vide koliko je tko izlazio, od dana kad je ušao u ekipu, i ekipni Wrapped.",
            "Link saziva koji sam pošalješ pokazuje tko zove, mjesto, vrijeme i koliko ljudi dolazi, bez imena. Nestaje 3 sata nakon početka.",
            "Username i profilnu vidi svatko tko te traži po točnom usernameu.",
            "Prijavljeni sadržaj vidi administrator, samo da bi odlučio o prijavi.",
            "Nikome ne prodajemo podatke i ne dijelimo ih za reklame.",
          ]}
        />
      </Odjeljak>

      <Odjeljak broj="4" naslov="Kome šaljemo podatke">
        <p>Samo izvršiteljima obrade koji nam trebaju da app radi:</p>
        <Popis
          stavke={[
            <>
              <b>Supabase</b>: baza, prijava i spremanje fotki. Poslužitelji su u EU (Irska). Supabase Pte. Ltd. je
              iz Singapura, pa se prijenos štiti standardnim ugovornim klauzulama EU-a (čl. 46 GDPR-a).
            </>,
            <>
              <b>Vercel Inc.</b> (SAD): poslužitelj appa i weba, funkcije rade u Frankfurtu. Prijenos u SAD se
              temelji na okviru EU–SAD za privatnost podataka ili standardnim ugovornim klauzulama.
            </>,
            <>
              <b>Brevo</b> (Francuska): šalje administratoru e-mail o svakoj prijavi (tko, koga, razlog).
            </>,
            <>
              <b>OpenStreetMap Foundation</b> (Nominatim): iz lokacije runde, zaokružene na oko 100 m, dobivamo ime
              kvarta. Šalje je naš poslužitelj, pa OSM ne vidi tko si.
            </>,
            <>
              <b>Apple</b>: prijava s Appleom (ako je odabereš) i slanje obavijesti na iPhone. Tekst obavijesti, npr.
              ime pajdaša ili mjesto saziva, ide preko Appleovih poslužitelja. Karta i traženje kafića oko runde rade
              kroz Appleove servise na tvom telefonu, po Appleovim pravilima privatnosti.
            </>,
          ]}
        />
        <p>Kopiju zaštitnih mjera za prijenos dobiješ na zahtjev, mailom.</p>
      </Odjeljak>

      <Odjeljak broj="5" naslov="Koliko dugo">
        <Popis
          stavke={[
            "Račun i sve u njemu čuvamo dok imaš račun.",
            "„Vani sam” s lokacijom brišemo najkasnije dan nakon što istekne.",
            "Javna runda je javna 24 sata; nakon toga je vide samo pajdaši.",
            "Kad obrišeš račun (Profil → Obriši račun), brišemo profil, runde, fotke, profilnu i sve vezano uz tebe. Kopija fotke može kratko ostati u međuspremniku mreže dok ne istekne.",
            "Kad obrišeš račun prijavljen s Appleom, prijavu opozivamo i kod Applea. Ako Apple tad ne odgovori, token čuvamo i pokušavamo ponovno jednom dnevno, najviše 30 dana, pa ga brišemo.",
            "Ako si vođa ekipe i obrišeš račun, vodstvo prelazi na člana koji je najdulje u ekipi; ekipa ostaje.",
            `Današnju rundu obrišeš sam: ⋯ na rundi → Obriši rundu (nestaje i slika). Za stariju piši na ${VODITELJ.mail} i obrisat ćemo je.`,
          ]}
        />
      </Odjeljak>

      <Odjeljak broj="6" naslov="Tvoja prava">
        <p>
          Imaš pravo na pristup svojim podacima, ispravak, brisanje, ograničenje obrade, prijenos podataka i
          prigovor na obradu koja se temelji na legitimnom interesu. Privolu (npr. lokaciju „Uvijek”) možeš povući
          kad hoćeš; to ne mijenja zakonitost onoga što je bilo prije. Piši na{" "}
          <a className="text-accent underline underline-offset-4" href={`mailto:${VODITELJ.mail}`}>{VODITELJ.mail}</a>,
          odgovaramo najkasnije u roku od mjesec dana.
        </p>
        <p>
          Pritužbu možeš podnijeti Agenciji za zaštitu osobnih podataka (AZOP), Ulica Metela Ožegovića 16,
          10000 Zagreb, azop@azop.hr, azop.hr.
        </p>
      </Odjeljak>

      <Odjeljak broj="7" naslov="Dob">
        <p>LAKAT je samo za osobe od 18 godina naviše. Ako saznamo da račun ima mlađa osoba, brišemo ga.</p>
      </Odjeljak>

      <Odjeljak broj="8" naslov="Sigurnost">
        <p>
          Promet ide šifrirano (HTTPS). Lozinke se ne spremaju u čitljivom obliku. Tko što smije vidjeti provodi
          baza za svaki upit, ne samo app.
        </p>
      </Odjeljak>

      {/* Lista čekanja (Petar q9, pregledao 2026-10-05). */}
      <Odjeljak broj="9" naslov="Lista čekanja i ova stranica">
        <p>Kad se na laktarenje.com upišeš na listu čekanja, spremamo:</p>
        <Popis
          stavke={[
            "tvoj e-mail,",
            "je li ti mobitel iPhone ili Android,",
            "odakle si došao na stranicu (npr. Instagram ili link koji ti je poslao pajdaš, i čiji je to link),",
            "ako ih upišeš: grad, kvart i ime koje želiš rezervirati u aplikaciji,",
            "vrijeme upisa i potvrde.",
          ]}
        />
        <p>
          <b>Zašto:</b> da ti pošaljemo mail za potvrdu i jedan mail kad LAKAT izađe (ako imaš Android, kad izađe Android
          verzija). Grad i kvart koristimo samo za poredak kvartova na stranici, gdje se vidi samo kvart, nikad ti.
        </p>
        <p>
          <b>Osnova:</b> tvoja privola (čl. 6. st. 1. t. a GDPR-a). Povlačiš je kad hoćeš, linkom za odjavu u mailu ili mailom
          na <a className="text-accent underline underline-offset-4" href={`mailto:${VODITELJ.mail}`}>{VODITELJ.mail}</a>, i tada
          brišemo tvoje podatke s liste.
        </p>
        <p>
          <b>Tko još vidi podatke:</b> mailove šalje Brevo (Sendinblue SAS, Francuska). Podaci liste čuvaju se u bazi aplikacije
          (Supabase, regija eu-west-1, EU).
        </p>
        <p>
          <b>Koliko dugo:</b> do 60 dana nakon što ti pošaljemo zadnji najavljeni mail, ili dok ne povučeš privolu. Ako se 1. 12.
          registriraš u aplikaciji, rezervirano ime prelazi na tvoj račun, a upis na listi se briše.
        </p>
        <p>
          <b>Na ovoj stranici:</b> posjete brojimo preko Vercel Web Analyticsa, bez kolačića i bez praćenja po drugim stranicama.
          Postavke zvuka, tvoj rekord u igri i lov na Krigle pamti samo tvoj preglednik i ne šalju se nama.
        </p>
        <p>
          <b>Ljestvica igre:</b> ako se sam upišeš na ljestvicu dana, spremamo nadimak koji upišeš, rezultat i dan. Nadimak i
          rezultat vide svi na stranici. Da nitko ne zatrpa ljestvicu, jedan dan čuvamo i šifrirani otisak tvoje IP adrese (ne samu
          adresu). Osnova je tvoja privola (upis je dobrovoljan), a upis brišemo nakon 30 dana ili ranije, na zahtjev mailom.
        </p>
      </Odjeljak>

      <Odjeljak broj="10" naslov="Izmjene">
        <p>
          Kad se ova pravila bitno promijene, javimo u appu i tražimo ponovni pristanak gdje je potreban. Na vrhu
          uvijek piše verzija.
        </p>
      </Odjeljak>
    </PravnaStranica>
  );
}
