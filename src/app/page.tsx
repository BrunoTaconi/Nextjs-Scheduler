import Image from "next/image";
import styles from "./styles/page.module.css";
import AtividadesPage from "./atividades";

export default function Home() {
  return (
    <main className={styles.main}>
        <AtividadesPage />
    </main>
  );
};
