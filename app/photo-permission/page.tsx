import { LegalPage } from "@/components/page/LegalPage";
import { pageMeta } from "@/lib/seo";
import { site } from "@/content/site";

export const metadata = pageMeta({
  title: "Permission to Share Your Installation",
  description:
    "What you are agreeing to when you tick the box at sign-off — what we publish, what we never publish, and how to change your mind.",
  path: "/photo-permission/",
});

/**
 * The page the sign-off consent tick box links to.
 *
 * UK GDPR consent has to be specific, informed, unambiguous and as easy to
 * withdraw as it was to give — and it must not be bundled in with anything
 * the customer has to agree to anyway. So this is its own page rather than a
 * clause buried in the terms, the tick is separate from the sign-off itself,
 * and withdrawal is one email with no reason required.
 */
export default function Page() {
  return (
    <LegalPage
      title="Permission to Share Your Installation"
      intro="What you're agreeing to if you tick the box at sign-off — in plain English, and short enough to actually read."
      path="/photo-permission"
    >
      <p>
        When your installation is signed off, we&rsquo;ll ask whether we can share photographs of
        the work and anything you&rsquo;ve written about it. It&rsquo;s entirely up to you. This
        page explains exactly what that means.
      </p>

      <h2 className="text-xl font-bold text-navy">Ticking the box is optional</h2>
      <p>
        Your installation, your warranty, your aftercare and your price are exactly the same
        whether you tick it or not. Nobody will ask you twice, and saying no has no consequence at
        all. If you&rsquo;d rather not, simply leave it unticked.
      </p>

      <h2 className="text-xl font-bold text-navy">What we may publish</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Photographs of the installation and the equipment we fitted.</li>
        <li>Your rating and any comments you left at sign-off, in your own words.</li>
        <li>
          How you asked to be credited — your first name, your first name and town, or nothing at
          all. You choose this at sign-off, and &ldquo;nothing at all&rdquo; is a perfectly normal
          choice.
        </li>
        <li>The type of system and, in general terms, the type of property.</li>
      </ul>
      <p>
        This appears on our website, and may also be used on our social media and in printed
        material such as brochures.
      </p>

      <h2 className="text-xl font-bold text-navy">What we never publish</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Your full address, house number, or anything that pinpoints where you live.</li>
        <li>Your phone number, email address or any payment details.</li>
        <li>Your surname, unless you have specifically asked us to use it.</li>
        <li>What you paid, or any part of your quote.</li>
        <li>
          Photographs showing people, pets, documents, vehicle number plates or personal
          belongings. Every photograph is checked by a person before it goes anywhere, and anything
          identifying is either removed or the photograph is not used.
        </li>
      </ul>

      <h2 className="text-xl font-bold text-navy">Changing your mind</h2>
      <p>
        You can withdraw permission at any time, for any reason, or for no reason. Email{" "}
        <a href={site.emailHref} className="font-semibold text-teal underline">
          {site.email}
        </a>{" "}
        or call{" "}
        <a href={site.phoneHref} className="font-semibold text-teal underline">
          {site.phoneDisplay}
        </a>{" "}
        and say you&rsquo;d like your installation taken down. We&rsquo;ll remove it from our
        website within five working days and won&rsquo;t use it again. You don&rsquo;t have to
        explain, and it won&rsquo;t affect anything else.
      </p>
      <p>
        Material already printed or already shared to social media can&rsquo;t always be recalled
        from everywhere it has spread, but we will stop using it and remove what is within our
        control.
      </p>

      <h2 className="text-xl font-bold text-navy">How long we keep it</h2>
      <p>
        For as long as it&rsquo;s published, and no longer than necessary after that. We keep a
        record of your permission — what you agreed to and when — because we&rsquo;re required to
        be able to show that consent was given.
      </p>

      <h2 className="text-xl font-bold text-navy">Your rights</h2>
      <p>
        Under UK GDPR you can ask what we hold about you, ask us to correct it, and ask us to
        delete it. Our{" "}
        <a href="/privacy-policy" className="font-semibold text-teal underline">
          privacy policy
        </a>{" "}
        covers this in full. If you&rsquo;re unhappy with how we&rsquo;ve handled your data, you
        can complain to the Information Commissioner&rsquo;s Office at{" "}
        <a
          href="https://ico.org.uk"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-teal underline"
        >
          ico.org.uk
        </a>
        .
      </p>

      <h2 className="text-xl font-bold text-navy">Who to contact</h2>
      <p>
        {site.legalName}, {site.address.line1}, {site.address.line2}, {site.address.city}{" "}
        {site.address.postcode}. Email{" "}
        <a href={site.emailHref} className="font-semibold text-teal underline">
          {site.email}
        </a>
        .
      </p>
    </LegalPage>
  );
}
