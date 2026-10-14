import { Section } from "@/components/layout/Section";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main>
      <section id="topo" className={styles.hero} />
      <Section id="sobre" />
      <Section id="servicos" tone="sand-2" />
      <Section id="experiencia" />
      <Section id="skills" tone="sand-2" />
      <Section id="projetos" />
      <Section id="contato" />
    </main>
  );
}
