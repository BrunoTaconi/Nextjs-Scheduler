'use client';
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

import Timeline from "../components/Timeline";

import dayjs from "dayjs";



export default function AtividadesPage() {
    dayjs.locale('pt-br');

    //estados que sao passados como props para o componente de timeline
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());


    return (
        <>
            <Head>
                <title>Next Scheduler</title>
                <meta charSet="UTF-8" />
                <html lang='pt-br' />
                <meta property="og:title" content="Atividades Scheduler" key="title" />
            </Head>
            <div>
                <Timeline month={currentMonth} year={currentYear} />
            </div>
        </>
    );
};
