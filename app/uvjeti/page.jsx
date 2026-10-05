import Link from "next/link";
import { PravnaStranica, Odjeljak, Popis, VODITELJ } from "../pravno";

export const metadata = { title: "Uvjeti korištenja — LAKAT." };

// Apple 1.2 (nula tolerancije za uvredljiv sadržaj, prijava, blokada) + EU
// Akt o digitalnim uslugama (pravila sadržaja, obrazloženje, žalba). Prihvaća
// se u appu, korak „Prvo pravila." (supabase-uvjeti1.sql). Tekst pregledavaju
// Petar i Claude (artifact pravno/, 3.10.2026.), ne pravnik.
export default function UvjetiPage() {
  return (
    <PravnaStranica
      naslov="Uvjeti korištenja"
      verzija="Verzija 1 · listopad 2026."
      sazetak={[
        "LAKAT je za punoljetne. Ako nisi, doviđenja.",
        "Psuj slobodno. Mržnja, prijetnje, psovanje Boga i vjere, golotinja i tuđe slike bez pristanka ne prolaze. Nula tolerancije.",
        "Svinjariju prijavi ili blokiraj, na rundi ili na profilu. Prijave gledamo brzo.",
        "Tvoje slike su tvoje. Nama daješ samo pravo da ih pokažemo onima kojima si ih namijenio.",
        "Pij pametno, ne vozi pijan.",
      ]}
    >
      <Odjeljak broj="1" naslov="O ovim uvjetima">
        <p>
          Ovi uvjeti vrijede između tebe i pružatelja usluge LAKAT: {VODITELJ.ime}, {VODITELJ.adresa}, e-mail{" "}
          <a className="text-accent underline underline-offset-4" href={`mailto:${VODITELJ.mail}`}>{VODITELJ.mail}</a>.
          Registracijom ih prihvaćaš. Kako postupamo s podacima piše u{" "}
          <Link className="text-accent underline underline-offset-4" href="/privatnost">pravilima privatnosti</Link>.
        </p>
        <p>
          Za app preuzet iz App Storea vrijedi i Appleov standardni ugovor o licenci (EULA). Apple nije strana ovih
          uvjeta i ne odgovara za LAKAT.
        </p>
      </Odjeljak>

      <Odjeljak broj="2" naslov="Tko smije">
        <Popis
          stavke={[
            "Moraš imati 18 godina ili više.",
            "Jedan račun po osobi, s tvojim pravim e-mailom. Lozinku čuvaš ti.",
            "Username ne smije vrijeđati, prijetiti ni glumiti nekog drugog.",
          ]}
        />
      </Odjeljak>

      <Odjeljak broj="3" naslov="Pravila ponašanja">
        <p>Psovke su dio LAKTA. Ovo nije, i za ovo nema tolerancije:</p>
        <Popis
          stavke={[
            "mržnja prema nekome zbog nacije, vjere, boje kože, spola, orijentacije ili invaliditeta;",
            "prijetnje, poticanje na nasilje ili samoozljeđivanje, maltretiranje i ponižavanje;",
            "psovanje Boga, svetaca i bilo koje vjere;",
            "golotinja, pornografija i seksualni sadržaj;",
            "slike drugih ljudi koje ne žele biti na njima, i bilo kakav sadržaj s maloljetnicima u neprimjerenom kontekstu;",
            "poticanje na prekomjerno pijenje, vožnju pod utjecajem ili drugo opasno ponašanje;",
            "spam, lažni profili, prevare i sve što je protuzakonito.",
          ]}
        />
      </Odjeljak>

      <Odjeljak broj="4" naslov="Kako to provodimo">
        <Popis
          stavke={[
            "Automatski filter odbije komentar, username ili tekst na fotki s mržnjom, prijetnjama ili psovanjem Boga.",
            "Svaku rundu i svaki profil možeš prijaviti ili blokirati. Blokirani te više ne vidi, ni ti njega.",
            "Javna runda se sama sakrije kad je prijave dvije različite osobe, dok je ne pogledamo.",
            "Prijave pregledavamo što prije, u pravilu unutar 24 sata.",
            "Kad maknemo tvoj sadržaj, u appu ti kažemo što i zašto. Ako se ne slažeš, stisni „Žali se” ili piši na e-mail i odgovorit ćemo.",
            "Za teže ili ponovljene prekršaje zatvaramo račun.",
          ]}
        />
        <p>
          Nezakonit sadržaj može prijaviti i netko tko nema LAKAT, na{" "}
          <a className="text-accent underline underline-offset-4" href={`mailto:${VODITELJ.mail}`}>{VODITELJ.mail}</a>.
          To je i kontaktna točka za tijela vlasti.
        </p>
      </Odjeljak>

      <Odjeljak broj="5" naslov="Tvoj sadržaj">
        <p>
          Fotke, video i tekst koje objaviš ostaju tvoji. Dok su u LAKTU, daješ nam neisključivo i besplatno pravo
          da ih spremimo i prikažemo onima kojima su namijenjeni (tvojim pajdašima, a javnu rundu ljudima u blizini).
          Ne koristimo ih ni za što drugo i ne prodajemo ih. Pravo prestaje kad sadržaj ili račun obrišeš.
        </p>
        <p>Odgovaraš za ono što objaviš, i za to da ljudi na slici pristaju biti na njoj.</p>
      </Odjeljak>

      <Odjeljak broj="6" naslov="Alkohol i sigurnost">
        <p>
          LAKAT služi za druženje uživo. Pij odgovorno, ne vozi pod utjecajem i pazi na sebe i druge. Javnu rundu stavljaš svjesno: vide je i ljudi koje ne poznaješ.
        </p>
      </Odjeljak>

      <Odjeljak broj="7" naslov="Usluga">
        <p>
          LAKAT je besplatan i dajemo ga takav kakav jest. Trudimo se da radi, ali ne možemo obećati da nikad neće
          stati ili izgubiti nešto. Za štetu odgovaramo samo koliko to zakon ne dopušta isključiti, uvijek za namjeru
          i krupnu nepažnju. Tvoja zakonska prava potrošača ostaju.
        </p>
      </Odjeljak>

      <Odjeljak broj="8" naslov="Prestanak">
        <p>
          Račun brišeš kad hoćeš, u appu: Profil → Obriši račun. Mi ga možemo zatvoriti ako kršiš ove uvjete, uz
          obrazloženje.
        </p>
      </Odjeljak>

      <Odjeljak broj="9" naslov="Izmjene i pravo">
        <p>
          Kad se uvjeti bitno promijene, javimo u appu i tražimo da ih ponovno prihvatiš. Vrijedi hrvatsko pravo;
          ako si potrošač iz druge zemlje EU, zadržavaš zaštitu koju ti daje pravo tvoje zemlje. Spor rješava nadležni
          sud prema zakonu.
        </p>
      </Odjeljak>
    </PravnaStranica>
  );
}
