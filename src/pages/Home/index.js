import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, Modal, ActivityIndicator } from 'react-native';
import Awesome from '@react-native-vector-icons/fontawesome6';
import Feather from '@react-native-vector-icons/feather';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import 'moment/locale/pt-br';
import api from '../../../src/services/api';

moment.locale('pt-br');

const formatarDataParaBusca = (dateString) => {
    return moment(dateString, 'YYYY-MM-DD').format('DDMMMYYYY').toUpperCase();
};

const formatarDiaSemana = (dia) => {
    const diaSemSufixo = dia.replace('-feira', '');
    return diaSemSufixo.charAt(0).toUpperCase() + diaSemSufixo.slice(1);
};

export default function Home() {
    const [modalVisible, setModalVisible] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(moment().format('YYYY-MM-DD'));
    const [data, setData] = useState(formatarDataParaBusca(moment().format('YYYY-MM-DD')));
    const [diaSemana, setDiaSemana] = useState(formatarDiaSemana(moment().format('dddd')));
    const [bancoDados, setBancoDados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState(false);
    
    const [diaInfo, setDiaInfo] = useState({
        regresso: '',
        tfm: '',
        rotina: '',
        uniforme: '',
        cafe: '',
        almoco: '',
        janta: '',
        observacoes: 'Carregando dados...'
    });

    useEffect(() => {
        const loadDados = async () => {
            try {
                setLoading(true);
                const response = await api.getDados();
                
                if (!response || response.length === 0) {
                    throw new Error('Dados não encontrados');
                }
                
                setBancoDados(response);
                atualizarDiaAtual(response);
                setApiError(false);
            } catch (error) {
                setDiaInfo(prev => ({
                    ...prev,
                    observacoes: 'Erro ao carregar dados. Verifique sua conexão.'
                }));
                setApiError(true);
            } finally {
                setLoading(false);
            }
        };

        loadDados();
    }, []);

    const atualizarDiaAtual = useCallback((dados) => {
        const dataAtual = formatarDataParaBusca(moment().format('YYYY-MM-DD'));
        const diaAtual = dados.find(item => item.data === dataAtual);
        
        if (diaAtual) {
            setDiaInfo({
                regresso: diaAtual.Regresso || '',
                tfm: diaAtual.TFM || '',
                rotina: diaAtual.Rotina || '',
                uniforme: diaAtual.Uniforme || '',
                cafe: diaAtual.Café || '',
                almoco: diaAtual.Almoço || '',
                janta: diaAtual.Janta || '',
                observacoes: diaAtual.Observações || 'Nada Consta.'
            });
        }
        setDiaSemana(formatarDiaSemana(moment().format('dddd')));
    }, []);

    const selecionarData = useCallback((day) => {
        const novaData = formatarDataParaBusca(day.dateString);
        const novoDiaSemana = formatarDiaSemana(moment(day.dateString).format('dddd'));
        
        if (bancoDados.length > 0) {
            const diaSelecionado = bancoDados.find(item => item.data === novaData);
            
            if (diaSelecionado) {
                setDiaInfo({
                    regresso: diaSelecionado.Regresso || '',
                    tfm: diaSelecionado.TFM || '',
                    rotina: diaSelecionado.Rotina || '',
                    uniforme: diaSelecionado.Uniforme || '',
                    cafe: diaSelecionado.Café || '',
                    almoco: diaSelecionado.Almoço || '',
                    janta: diaSelecionado.Janta || '',
                    observacoes: diaSelecionado.Observações || 'Nada Consta.'
                });
            }
        }
        
        setData(novaData);
        setDiaSemana(novoDiaSemana);
        setModalVisible(false);
    }, [bancoDados]);

    const abrirCalendario = useCallback(() => setModalVisible(true), []);
    const fecharCalendario = useCallback(() => setModalVisible(false), []);
    const onMonthChange = useCallback((month) => setCurrentMonth(month.dateString), []);

    const renderCalendarHeader = useCallback((date) => (
        <Text style={{ fontSize: 25, fontWeight: 'bold' }}>
            {moment(currentMonth).format('MMMM YYYY')}
        </Text>
    ), [currentMonth]);

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <Image 
                    source={require('../../../assets/images/2btloplitfn-faixa.png')} 
                    style={styles.loadingImage}
                />
                <ActivityIndicator size="large" color="#111111" style={styles.loadingSpinner} />
                <Text style={styles.loadingText}>Carregando informações do quadro...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.Container}>
            <View style={styles.Container}>
                <View style={[styles.Cabecalho, { paddingLeft: 10 }]}>
                    <Image 
                        style={styles.BrasaoOM}
                        source={require('../../../assets/images/2btloplitfn.png')}
                    />

                    <Text style={styles.NomeOM}>
                        2ºBtlOpLitFN
                    </Text>

                    <TouchableOpacity style={styles.Icone} onPress={abrirCalendario}>
                        <Awesome name="calendar-days" size={35} color="#111111" />
                    </TouchableOpacity>
                </View>

                <View style={styles.Funcoes}>
                    <Text style={styles.Dia}>{diaSemana}</Text>
                    <Text style={styles.Data}>{data}</Text>
                </View>

                <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={fecharCalendario}>
                    <View style={styles.Overlay}>
                        <View style={styles.ModalContent}>
                            <TouchableOpacity style={styles.BotaoFechar} onPress={fecharCalendario}>
                                <Feather name="x" size={35} color="#CD0000" />
                            </TouchableOpacity>
                                <Calendar
                                    current={currentMonth}
                                    onDayPress={selecionarData}
                                    onMonthChange={onMonthChange}
                                    markedDates={{
                                        [data]: { selected: true, selectedColor: '#0EAA' }
                                    }}
                                    monthFormat={'MMMM yyyy'}
                                    dayNamesShort={['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']}
                                    firstDay={0}
                                    hideExtraDays={true}
                                    renderHeader={renderCalendarHeader}
                                    theme={{
                                        calendarBackground: '#ffffff',
                                        textSectionTitleColor: '#b6c1c',
                                        selectedDayBackgroundColor: '#00adf5',
                                        selectedDayTextColor: '#ffffff',
                                        todayTextColor: '#00adf5',
                                        dayTextColor: '#2d4150',
                                        textDisabledColor: '#d9e1e8',
                                        dotColor: '#00adf5',
                                        selectedDotColor: '#ffffff',
                                        arrowColor: '#111111',
                                        monthTextColor: '#111111',
                                        textDayFontSize: 23,
                                        textMonthFontSize: 18,
                                        textDayHeaderFontSize: 16,
                                        'stylesheet.calendar.header': {
                                            week: {
                                                marginTop: 7,
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                paddingLeft: 10,
                                                paddingRight: 10
                                            },
                                            dayHeader: {
                                                marginTop: 2,
                                                marginBottom: 7,
                                                width: 32,
                                                textAlign: 'center',
                                                fontSize: 16,
                                                color: '#111111',
                                                fontFamily: 'Bahnschrift'
                                            }
                                        },
                                        'stylesheet.calendar.main': {
                                            week: {
                                                marginTop: 7,
                                                marginBottom: 7,
                                                flexDirection: 'row',
                                                justifyContent: 'space-around'
                                            },
                                            dayContainer: {
                                                width: 40,
                                                height: 40,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                margin: 2
                                            }
                                        }
                                    }}
                                />
                        </View>
                    </View>
                </Modal>

                <View style={styles.EspacoCentral}>
                    <View style={styles.Tabela}>
                        <Text style={[styles.TabelaCinza, { borderEndWidth: 1 }]}>REGRESSO</Text>
                        <Text style={styles.TabelaCinza}>TFM</Text>
                    </View>

                    <View style={styles.Tabela}>
                        <Text style={[styles.TabelaBranca, { borderEndWidth: 1 }]}>{diaInfo.regresso}</Text>
                        <Text style={styles.TabelaBranca}>{diaInfo.tfm}</Text>
                    </View>

                    <View style={styles.Tabela}>
                        <Text style={[styles.TabelaCinza, { borderEndWidth: 1 }]}>ROTINA</Text>
                        <Text style={styles.TabelaCinza}>UNIFORME</Text>
                    </View>

                    <View style={styles.Tabela}>
                        <Text style={[styles.TabelaBranca, { borderEndWidth: 1 }]}>{diaInfo.rotina}</Text>
                        <Text style={styles.TabelaBranca}>{diaInfo.uniforme}</Text>
                    </View>

                    <View style={styles.Tabela}>
                        <Text style={[styles.TabelaCinza, { flex: 1, backgroundColor: '#AAAAAA' }, {borderTopWidth: 1}]}>RANCHO</Text>
                    </View>

                    <View style={styles.Tabela}>
                        <Text style={[styles.TabelaCinza, { borderEndWidth: 1 }]}>CAFÉ</Text>
                        <Text style={[styles.TabelaCinza, { borderEndWidth: 1 }]}>ALMOÇO</Text>
                        <Text style={styles.TabelaCinza}>JANTA</Text>
                    </View>

                    <View style={styles.Tabela}>
                        <Text style={[styles.TabelaBranca, {fontSize: 20}, { borderEndWidth: 1 }]}>{diaInfo.cafe}</Text>
                        <Text style={[styles.TabelaBranca, {fontSize: 20}, { borderEndWidth: 1 }]}>{diaInfo.almoco}</Text>
                        <Text style={[styles.TabelaBranca, {fontSize: 20}]}>{diaInfo.janta}</Text>
                    </View>
                </View>

                <View style={styles.Tabela}>
                    <Text style={[styles.TabelaCinza, { flex: 1, backgroundColor: '#AAAAAA' }, {borderTopWidth: 1}]}>
                        OBSERVAÇÕES
                    </Text>
                </View>

                <View style={[styles.Tabela, { flex: 5 }]}>
                    <Text style={[styles.TabelaBranca, styles.observacoesText]}>{diaInfo.observacoes}</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    Container: {
        flex: 1
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF'
    },
    loadingImage: {
        width: 250,
        height: 250,
        resizeMode: 'contain',
        marginBottom: 30
    },
    loadingSpinner: {
        marginVertical: 20
    },
    loadingText: {
        marginTop: 20,
        fontSize: 18,
        fontFamily: 'Bahnschrift',
        color: '#111111',
        textAlign: 'center',
        paddingHorizontal: 20
    },
    Cabecalho: {
        flex: 2,
        width: '100%',
        elevation: 30,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        borderBottomWidth: 1
    },
    BrasaoOM: {
        width: 60,
        height: 60,
        paddingLeft: 10
    },
    NomeOM: {
        flex: 6,
        fontFamily: 'Bahnschrift',
        fontSize: 30,
        fontWeight: 'bold',
        color: '#111111',
        padding: 5
    },
    Icone: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingRight: 20
    },
    Overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    ModalContent: {
        width: '95%',
        height: '80%',
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center'
    },
    BotaoFechar: {
        alignSelf: 'flex-end',
        marginBottom: 10
    },
    Funcoes: {
        flex: 2.5,
        width: '100%',
        elevation: 20,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1
    },
    Dia: {
        fontFamily: 'Bahnschrift',
        fontSize: 30,
        fontWeight: 'bold',
        color: '#111111'
    },
    Data: {
        fontFamily: 'Bahnschrift',
        fontSize: 40,
        fontWeight: 'bold',
        color: '#111111'
    },
    EspacoCentral: {
        flex: 6.5,
        alignContent: 'center'
    },
    Tabela: {
        flex: 1,
        flexDirection: 'row',
        width: '100%',
        height: '100%',
        backgroundColor: '#FFF',
        elevation: 10,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        borderBottomWidth: 1
    },
    TabelaCinza: {
        flex: 0.5,
        height: '100%',
        backgroundColor: '#C0C0C0',
        borderBottomWidth: 1,
        textAlign: 'center',
        textAlignVertical: 'center',
        fontFamily: 'Bahnschrift',
        fontSize: 25,
        fontWeight: 'bold',
        color: '#111111'
    },
    TabelaBranca: {
        flex: 0.5,
        height: '100%',
        textAlign: 'center',
        textAlignVertical: 'center',
        fontFamily: 'Bahnschrift',
        fontSize: 23,
        fontWeight: 'bold',
        color: '#111111'
    },
    observacoesText: {
        textAlignVertical: 'top',
        paddingTop: 10,
        fontSize: 18,
        textAlign: 'justify',
        flex: 1,
        padding: 10
    }
});