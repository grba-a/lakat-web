import { PravnaStranica, Odjeljak, Popis, VODITELJ } from "../pravno";

export const metadata = { title: "Pravila privatnosti — LAKAT.", alternates: { canonical: "/privatnost" } };

// GDPR čl. 13 + Apple 5.1.1(i). Činjenice su iz koda (inventura 3.10.2026.):
// kad se promijeni tko dobiva podatke, mijenja se i ovo. Tekst pregledavaju
// Petar i Claude (artifact pravno/), ne pravnik.
export default function PrivatnostPage() {
  return (
    <PravnaStranica
      naslov="Pravila privatnosti"
      verzija="Verzija 2 · listopad 2026. (dodana lista čekanja)"
      sazetak={[
        "Tvoje runde, slike i lokaciju vide samo tvoji prihvaćeni pajdaši. Iznimka je runda koju sam staviš „Javno u blizini”.",
        "Ne prodajemo ti podatke. Nema reklama, nema praćenja po drugim appovima.",
        "Lokaciju šaljemo samo kad objaviš rundu ili upališ „Vani sam”.",
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
              <b>Račun</b>: e-mail, lozinka (ne spremamo je u čitljivom obliku), username i profilna. Bez toga nema računa
              (čl. 6. st. 1. t. b GDPR-a, izvršenje ugovora).
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
              <b>Druženje</b>: pajdaši, zahtjevi, komentari, reakcije, pozivi na laktanje, ekipe, ankete, aura i
              rezultati igara (t. b).
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
              <b>Obavijesti</b>: ako ih dopustiš na webu, preglednik nam da adresu za slanje obavijesti. Briše se
              kad je preglednik odbije ili kad obrišeš račun (t. b).
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
            "Runde, slike, pića, lokaciju i „Vani sam” vide samo pajdaši koje si prihvatio. To provodi baza, ne samo app.",
            "Javnu rundu („Javno u blizini”, ugašeno dok ga sam ne upališ) 24 sata vide svi s LAKTOM u krugu od 1 km: fotku, tvoj username i profilnu. Mjesto vide zaokruženo na oko 100 m.",
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
              <b>Apple</b>: karta i traženje kafića oko runde rade kroz Appleove servise na tvom telefonu, po
              Appleovim pravilima privatnosti.
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
          Postavke zvuka, rezultat igre i lov na Krigle pamti samo tvoj preglednik i ne šalju se nama.
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
