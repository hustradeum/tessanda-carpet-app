import type { FormEvent } from "react";

interface Props {
  handleFormSubmit: (e: FormEvent<HTMLButtonElement>) => void;
  firstname: string;
  lastname: string;
  mail: string;
  phone: string;
  message: string;
  setFirstname: (v: string) => void;
  setLastname: (v: string) => void;
  setMail: (v: string) => void;
  setPhone: (v: string) => void;
  setMessage: (v: string) => void;
}

export default function Form({
  handleFormSubmit,
  firstname,
  lastname,
  mail,
  phone,
  message,
  setFirstname,
  setLastname,
  setMail,
  setPhone,
  setMessage,
}: Props) {
  function handleSubmit(e: FormEvent<HTMLButtonElement>) {
    const btn = e.target as HTMLButtonElement;
    if (btn.parentElement instanceof HTMLFormElement) {
      const elForm = btn.parentElement;
      if (elForm.checkValidity()) {
        handleFormSubmit(e);
      }
    }
  }

  return (
    <div className="send-carpet-form">
      <div className="send-carpet-form__title">Offerte anfordern</div>
      <div className="send-carpet-form__form">
        <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); }}>
          <label htmlFor="firstname">
            <span>Vorname</span>
            <input type="text" id="firstname" name="firstname" required value={firstname} onChange={(e) => setFirstname(e.target.value)} />
          </label>
          <label htmlFor="lastname">
            <span>Nachname</span>
            <input type="text" id="lastname" name="lastname" required value={lastname} onChange={(e) => setLastname(e.target.value)} />
          </label>
          <label htmlFor="mail">
            <span>Mail</span>
            <input type="email" id="mail" name="mail" required value={mail} onChange={(e) => setMail(e.target.value)} />
          </label>
          <label htmlFor="phone">
            <span>Telefon</span>
            <input type="tel" id="phone" name="phone" required value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label htmlFor="message">
            <span>
              Nachricht <small>(optional)</small>
            </span>
            <textarea id="message" name="message" value={message} onChange={(e) => setMessage(e.target.value)} />
          </label>
          <p>
            <small>
              Ihrer Anfrage wird automatisch die Teppichkonfiguration als PDF beigefügt. Sie
              erhalten zudem eine Kopie als Bestätigung an Ihre E-Mail-Adresse.
            </small>
          </p>
          <button className="button send-carpet-mail-submit-button" type="submit" onClick={handleSubmit}>
            Anfrage absenden
          </button>
        </form>
      </div>
    </div>
  );
}
