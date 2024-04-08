'use client';
import React, { useEffect, useState } from 'react';

//utils
import moment from 'moment';
import Select from 'react-select';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';

//estilos
import styles from '../styles/timeline.module.css';

//icones
import { FaCircleChevronRight } from "react-icons/fa6";
import { FaCircleChevronLeft } from "react-icons/fa6";
import { PiCursorClick } from "react-icons/pi";
import { IoClose } from "react-icons/io5";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { FaEdit } from "react-icons/fa";
import axios from 'axios';


const customSelectStyles = {
    control: (provided: any) => ({
        ...provided,
        width: 510,
    }),
};

interface Atividade {
    atividade: string;
}

interface TimelineProps {
    month: number,
    year: number,
}

const Timeline = ({ month, year }: TimelineProps) => {
    //ajusta a localizacao para o brasil
    dayjs.locale('pt-br');

    //estados para mes, dia e ano
    const [currentMonth, setCurrentMonth] = useState(month);
    const [currentYear, setCurrentYear] = useState(year);
    const [displayedMonthName, setDisplayedMonthName] = useState('');

    //estado para o modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    //estados para o select
    const [isClearable, setIsClearable] = useState(true);
    const [isSearchable, setIsSearchable] = useState(true);

    //estado para armazenar a atividade selecionada e suas datas no select do modal
    const [selectedAtividade, setSelectedAtividade] = useState<Atividade | null>(null);
    const [selectedInitialDate, setSelectedInitialDate] = useState<dayjs.Dayjs | null>(null);;
    const [selectedFinalDate, setSelectedFinalDate] = useState<dayjs.Dayjs | null>(null);;

    //dados mockados das atividades
    const [atividades, setAtividades] = useState([
        {
            atividade: "Atividade número 1",
            dataInicial: "2024-04-08",
            descricao: "Descrição da atividade 1",
            dataFinal: "2024-04-12",
            codigo: 1,
        },
        {
            atividade: "Atividade número 2",
            dataInicial: "2024-04-10",
            descricao: "Descrição da atividade 2",
            dataFinal: "2024-04-15",
            codigo: 2,
        },
        {
            atividade: "Atividade número 3",
            dataInicial: "2024-04-13",
            descricao: "Descrição da atividade 3",
            dataFinal: "2024-04-15",
            codigo: 3,
        },
        {
            atividade: "Atividade número 4",
            dataInicial: "2024-04-08",
            descricao: "Descrição da atividade 4",
            dataFinal: "2024-04-23",
            codigo: 4,
        },
        {
            atividade: "Atividade número 5",
            dataInicial: "2024-04-03",
            descricao: "Descrição da atividade 5",
            dataFinal: "2024-04-13",
            codigo: 5,
        },
    ])

 
    //funcao para navegar para o mes anterior
    const navigateToPreviousMonth = () => {
        setCurrentMonth(prevMonth => {
            if (prevMonth === 1) {
                setCurrentYear(year => year - 1);
                return 12;
            }
            return prevMonth - 1;
        });
    };

    //funcao para navegar para o próximo mês
    const navigateToNextMonth = () => {
        setCurrentMonth(prevMonth => {
            if (prevMonth === 12) {
                setCurrentYear(year => year + 1);
                return 1;
            }
            return prevMonth + 1;
        });
    };

    //efeito para atualizar o nome do mes exibido com base no mes e a no atuais
    useEffect(() => {
        moment.locale('pt-br'); //se nao tiver o padrao é ingles

        //formatacao do nome do mes e ano
        const monthName = moment([currentYear, currentMonth - 1]).format('MMMM YYYY');
        setDisplayedMonthName(monthName);
    }, [currentMonth, currentYear]);

    //funcao para gerar os dias do mes
    const generateDaysOfMonth = () => {
        const days = [];
        const daysInMonth = moment([currentYear, currentMonth - 1]).daysInMonth();
        const firstDayOfMonth = moment([currentYear, currentMonth - 1]).startOf('month');

        for (let i = 1; i <= daysInMonth; i++) {
            const currentDay = firstDayOfMonth.clone().date(i);
            const isWeekend = currentDay.isoWeekday() === 6 || currentDay.isoWeekday() === 7;
            days.push({
                number: i,
                dayOfWeek: currentDay.format('ddd'),
                date: currentDay.format('YYYY-MM-DD'),
                isWeekend: isWeekend,
            });
        }
        return days;
    };

    //define os dias baseado na funcao acima
    const days = generateDaysOfMonth();

    //funcao para calcular o intervalo da barraa de atividade com base na data inicial e final
    const calculateGridRange = (atividade: { dataInicial: moment.MomentInput; dataFinal: moment.MomentInput; }) => {
        const initialDate = moment(atividade.dataInicial);
        const finalDate = moment(atividade.dataFinal);

        const currentMonthStart = moment([currentYear, currentMonth - 1]).startOf('month');
        const currentMonthEnd = moment([currentYear, currentMonth - 1]).endOf('month');

        const firstDayOfMonth = moment([currentYear, currentMonth - 1]).startOf('month');
        const lastDayOfMonth = moment([currentYear, currentMonth - 1]).endOf('month');

        //checa se a atividade passa por 2 meses diferentes
        if (initialDate.isSameOrBefore(lastDayOfMonth) && finalDate.isSameOrAfter(firstDayOfMonth)) {
            let initialDay = Math.max(1, initialDate.date()) + 1;
            let finalDay = Math.min(finalDate.date(), lastDayOfMonth.date()) + 1; //soma 1 por conta do span da grid

            if (initialDate.isBefore(firstDayOfMonth)) {
                initialDay = 1;
            }

            if (finalDate.isAfter(lastDayOfMonth)) {
                finalDay = lastDayOfMonth.date() + 1;
            }

            return { initialDay, finalDay };
        }
        return null;
    };

    //acha o primeiro dia do array de atividades
    const findEarliestDate = (atividades: any[]) => {
        let earliestDate = moment(atividades[0].dataInicial);

        atividades.forEach(atividade => {
            const initialDate = moment(atividade.dataInicial);
            if (initialDate.isBefore(earliestDate)) {
                earliestDate = initialDate;
            }
        })
        return earliestDate;
    }

    //acha o ultimo dia do array de atividades
    const findLatestDate = (atividades: any[]) => {
        let latestDate = moment(atividades[0].dataFinal);

        atividades.forEach(atividade => {
            const finalDate = moment(atividade.dataFinal);
            if (finalDate.isAfter(latestDate)) {
                latestDate = finalDate;
            }
        })
        return latestDate;
    }

    //função para calcular a barra total das atividades com base nas datas de início e término das atividades
    const calculateTotalBarRange = () => {
        const firstDay = findEarliestDate(atividades);
        const lastDay = findLatestDate(atividades);

        const firstDayOfMonth = moment([currentYear, currentMonth - 1]).startOf('month');
        const lastDayOfMonth = moment([currentYear, currentMonth - 1]).endOf('month');

        //checa se a barra terá que passar por 2 meses diferentes
        if (firstDay.isSameOrBefore(lastDayOfMonth) && lastDay.isSameOrAfter(firstDayOfMonth)) {
            let initialDay = Math.max(1, firstDay.date()) + 1;
            let finalDay = Math.min(lastDay.date(), lastDayOfMonth.date()) + 1;

            if (firstDay.isBefore(firstDayOfMonth)) {
                initialDay = 1;
            }

            if (lastDay.isAfter(lastDayOfMonth)) {
                finalDay = lastDayOfMonth.date() + 1; //soma 1 por conta do span da grid
            }

            return { initialDay, finalDay };
        }

        return null;
    };

    //funcao para abrir o modal
    const openModal = () => {
        setIsModalOpen(true);
    };

    //funcao para fechar o modal
    const closeModal = () => {
        setIsModalOpen(false);
    };

    //funcao para selecionar atividade a ser editada
    const handleAtividadeChange = (selectedOption: any) => {
        setSelectedAtividade(selectedOption);
        setSelectedInitialDate(dayjs(selectedOption?.dataInicial));
        setSelectedFinalDate(dayjs(selectedOption?.dataFinal));
    };

    //funcao para alterar a data final da atividade
    const handleFinalDateChange = (selectedAtividade: any) => {
        //verifica se a data final é válida e após a data inicial
        if (!selectedFinalDate || !selectedInitialDate || selectedFinalDate.isBefore(selectedInitialDate)) {
            console.error('A data final deve ser posterior à data inicial.');
            return; //sai da função se a data final for inválida ou anterior à data inicial
        }

        //atualiza a atividade selecionada com a nova data final
        const updatedAtividade = {
            ...selectedAtividade,
            dataFinal: selectedFinalDate.format('YYYY-MM-DD'),
        };

        //atualiza o estado das atividades para refletir a mudança
        const updatedAtividades = atividades.map(atividade =>
            atividade.codigo === selectedAtividade.codigo ? updatedAtividade : atividade
        );

        //tualiza o estado com as atividades atualizadas
        setAtividades(updatedAtividades);

        // Fechamento do modal após a conclusão bem-sucedida da atualização
        closeModal();
    };

    return (
        <div className={styles.global}>
            <div className={styles.pageTitle}>
                <p>Scheduler</p>
            </div>
            <div className={styles.centerBtns}>
                {/* botoes para avancar ou retroceder mes */}
                <button className={styles.prevBtn} onClick={navigateToPreviousMonth}><FaCircleChevronLeft size={20} /></button>
                <button className={styles.nextBtn} onClick={navigateToNextMonth}><FaCircleChevronRight size={20} /></button>
            </div>

            <>
                <section className={styles.calendarContainer}>
                    <div className={styles.editarDiv}>
                        {/* abre o modal pra editar a atividade */}
                        <button className={styles.editBtn} onClick={openModal}>Editar Atividades <PiCursorClick /></button>
                    </div>
                    {/* exibe o nome do mes e renderiza os dias do mes */}
                    <div className={styles.subgridMonth}>
                        <h4>{displayedMonthName}</h4>
                        {days.map((day, index) => (
                            <div key={index} className={`${styles.day} ${day.isWeekend ? styles.weekend : ''}`}>
                                <div className={styles.numeroDia}>{day.number}</div>
                            </div>
                        ))}
                    </div>

                    {/* renderiza os titulos das atividades no lado esquerdo do scheduler */}
                    <div className={styles.titulos} style={{ gridTemplateRows: `repeat(${atividades.length + 1})` }}>
                        <div className={styles.title}>Timeline Final</div>
                        {atividades.map(atividade => (
                            <div key={atividade.codigo} className={styles.title}>
                                {atividade.atividade}
                            </div>
                        ))}
                    </div>

                    {/* renderiza as barras com o range das atividades */}
                    <div className={styles.barras} style={{ gridTemplateRows: `repeat(${atividades.length + 1}, minmax(30px, 40px))` }}>
                        {calculateTotalBarRange() && (
                            <div className={styles.atividadeDiv}>
                                <div className={styles.barraTotal}
                                    style={{ gridColumn: `${calculateTotalBarRange()?.initialDay} / ${calculateTotalBarRange()?.finalDay}` }}>
                                </div>
                            </div>
                        )}
                        {atividades.map((atividade, index) => {
                            const gridRange = calculateGridRange(atividade);
                            if (!gridRange) return null;

                            const { initialDay, finalDay } = gridRange;
                            return (
                                <div key={atividade.codigo} className={styles.atividadeDiv} style={{ gridRow: `${index + 2}` }}>
                                    <div style={{ gridColumn: `${initialDay} / ${finalDay} `, gridRow: `${index + 2}` }}></div>
                                </div>
                            );
                        })}
                    </div>

                    {/* modal para editar a atividade */}
                    {isModalOpen && (
                        <div className={styles.modalOverlay}>
                            <div className={styles.modal}>
                                <div className={styles.modalTop}>
                                    <h4>Edite suas atividades</h4>
                                    <button className={styles.closeBtn} onClick={closeModal}><IoClose /></button>
                                </div>
                                <div className={styles.modalContent}>
                                    <div className={styles.atividadesSelect}>
                                        <h4>Qual atividade deseja editar?</h4>
                                    </div>
                                    <div>
                                        <Select
                                            className="basic-single"
                                            classNamePrefix="select"
                                            value={selectedAtividade ? { label: selectedAtividade.atividade, value: selectedAtividade.atividade } : null}
                                            isClearable={isClearable}
                                            isSearchable={isSearchable}
                                            name="atividade"
                                            options={atividades.map(atividade => ({
                                                label: atividade.atividade,
                                                value: atividade.atividade
                                            }))}
                                            onChange={(selectedOption) => handleAtividadeChange(selectedOption ? atividades.find(atividade => atividade.atividade === selectedOption.value) : null)}
                                            styles={{ ...customSelectStyles, ...styles }}
                                        />
                                    </div>
                                    <div className={styles.datePickers}>
                                        <div className={styles.datePicker}>
                                            <h4>Data inicial:</h4>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                    disabled
                                                    label="Selecione uma data"
                                                    sx={{ width: 240 }} //defina o tamanho desejado
                                                    value={selectedInitialDate} //defina o valor inicial
                                                    onChange={(date) => setSelectedInitialDate(date)} //atualiza o estado ao selecionar uma nova data
                                                    format="DD/MM/YYYY"
                                                />
                                            </LocalizationProvider>
                                        </div>

                                        <div className={styles.datePicker}>
                                            <h4>Data final:</h4>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                    label="Selecione uma data"
                                                    sx={{ width: 240 }}
                                                    value={selectedFinalDate}
                                                    onChange={(date) => setSelectedFinalDate(date)} //atualiza o estado ao selecionar uma nova data
                                                    format="DD/MM/YYYY"
                                                />
                                            </LocalizationProvider>
                                        </div>
                                    </div>

                                    <button className={styles.saveBtn}
                                        onClick={() => handleFinalDateChange(selectedAtividade)}>Salvar</button>

                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </>
        </div>
    )
}

export default Timeline;