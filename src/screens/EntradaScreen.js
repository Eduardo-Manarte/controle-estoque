import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import { globalStyles } from '../styles/globalStyles';
import { entradaStyles } from '../styles/entradaStyles';

const EntradaScreen = () => {
  const [entradas, setEntradas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProd, setSelectedProd] = useState('');
  const [qtd, setQtd] = useState('');
  const [obs, setObs] = useState('');

  // carrega dados quando entra na tela
  useFocusEffect(
    useCallback(() => {
      loadStuff();
    }, [])
  );

  useEffect(() => {
    loadStuff();
  }, []);

  // função pra carregar os dados
  const loadStuff = async () => {
    setLoading(true);
    
    try {
      // pega produtos
      const prods = await AsyncStorage.getItem('produtos');
      if (prods) {
        setProdutos(JSON.parse(prods));
      }

      // pega entradas
      const ents = await AsyncStorage.getItem('entradas');
      if (ents) {
        let data = JSON.parse(ents);
        // ordena por data
        data = data.sort((a, b) => new Date(b.data) - new Date(a.data));
        setEntradas(data);
      }
    } catch (e) {
      console.log('erro ao carregar:', e);
    }
    
    setLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadStuff();
    setIsRefreshing(false);
  };

  // salva as entradas
  const saveEntradas = async (newEntradas) => {
    try {
      const sorted = newEntradas.sort((a, b) => new Date(b.data) - new Date(a.data));
      await AsyncStorage.setItem('entradas', JSON.stringify(sorted));
      setEntradas(sorted);
    } catch (error) {
      console.log('erro save:', error);
    }
  };

  // atualiza estoque do produto
  const updateStock = async (prodId, quantidade) => {
    try {
      const prods = await AsyncStorage.getItem('produtos');
      if (prods) {
        let prodList = JSON.parse(prods);
        const idx = prodList.findIndex(p => p.id === prodId);
        if (idx !== -1) {
          prodList[idx].quantidade = Math.max(0, prodList[idx].quantidade + quantidade);
          await AsyncStorage.setItem('produtos', JSON.stringify(prodList));
          setProdutos(prodList);
        }
      }
    } catch (e) {
      console.log('erro update stock:', e);
    }
  };

  const getProd = (id) => {
    return produtos.find(p => p.id === id);
  };

  // filtro
  const filteredData = entradas.filter(entrada => {
    if (!search) return true;
    
    const prod = getProd(entrada.produtoId);
    if (!prod) return false;
    
    return prod.nome.toLowerCase().includes(search.toLowerCase()) ||
           (entrada.observacao && entrada.observacao.toLowerCase().includes(search.toLowerCase()));
  });

  const openModal = () => {
    if (produtos.length === 0) {
      Alert.alert('Ops!', 'Cadastre produtos primeiro na aba Estoque');
      return;
    }
    
    // reset form
    setSelectedProd('');
    setQtd('');
    setObs('');
    setShowModal(true);
  };

  const handleSave = async () => {
    // validações básicas
    if (!selectedProd || !qtd) {
      Alert.alert('Erro', 'Preencha produto e quantidade');
      return;
    }

    const quantidade = parseInt(qtd);
    if (isNaN(quantidade) || quantidade <= 0) {
      Alert.alert('Erro', 'Quantidade inválida');
      return;
    }

    const produto = getProd(selectedProd);
    if (!produto) {
      Alert.alert('Erro', 'Produto não encontrado');
      return;
    }

    try {
      // cria entrada
      const entrada = {
        id: Date.now().toString(),
        produtoId: selectedProd,
        quantidade: quantidade,
        observacao: obs.trim(),
        data: new Date().toISOString(),
        cancelada: false,
      };

      const newEntradas = [entrada, ...entradas];
      await saveEntradas(newEntradas);
      await updateStock(selectedProd, quantidade);
      
      setShowModal(false);
      Alert.alert('Sucesso!', `${produto.nome}: +${quantidade}`);
      loadStuff(); // recarrega dados
      
    } catch (error) {
      console.log('erro save:', error);
      Alert.alert('Erro', 'Não foi possível salvar');
    }
  };

  const cancelEntry = (entrada) => {
    if (entrada.cancelada) {
      Alert.alert('Aviso', 'Já foi cancelada');
      return;
    }

    const produto = getProd(entrada.produtoId);
    if (!produto) {
      Alert.alert('Erro', 'Produto não encontrado');
      return;
    }

    // checa se tem estoque
    if (produto.quantidade < entrada.quantidade) {
      Alert.alert('Erro', `Estoque insuficiente. Atual: ${produto.quantidade}, Necessário: ${entrada.quantidade}`);
      return;
    }
    
    Alert.alert(
      'Cancelar entrada',
      `Cancelar ${entrada.quantidade} de "${produto.nome}"?`,
      [
        { text: 'Não' },
        {
          text: 'Sim',
          onPress: async () => {
            try {
              const newEntradas = entradas.map(e => 
                e.id === entrada.id ? { ...e, cancelada: true } : e
              );
              await saveEntradas(newEntradas);
              await updateStock(entrada.produtoId, -entrada.quantidade);
              Alert.alert('OK', 'Cancelado com sucesso');
              loadStuff();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível cancelar');
            }
          },
        },
      ]
    );
  };

  // formata data
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return 'Data inválida';
    }
  };

  const renderItem = ({ item }) => {
    const produto = getProd(item.produtoId);
    
    // se não achar o produto
    if (!produto) {
      return (
        <View style={[globalStyles.itemCard, globalStyles.itemCardError]}>
          <Text style={globalStyles.errorText}>Produto não encontrado</Text>
          <Text style={globalStyles.errorSubText}>ID: {item.produtoId}</Text>
        </View>
      );
    }

    return (
      <View style={[
        globalStyles.itemCard,
        item.cancelada && globalStyles.itemCardCanceled
      ]}>
        <View style={globalStyles.itemHeader}>
          <View style={globalStyles.itemInfo}>
            {produto.foto ? (
              <Image source={{ uri: produto.foto }} style={globalStyles.itemImage} />
            ) : (
              <View style={globalStyles.itemNoImage}>
                <Ionicons name="cube-outline" size={20} color="#ccc" />
              </View>
            )}
            <View style={globalStyles.itemDetails}>
              <Text style={[
                globalStyles.itemName,
                item.cancelada && globalStyles.textCanceled
              ]}>
                {produto.nome}
              </Text>
              <Text style={[
                globalStyles.quantityText,
                item.cancelada && globalStyles.textCanceled
              ]}>
                +{item.quantidade} unid
              </Text>
              <Text style={[
                globalStyles.stockText,
                item.cancelada && globalStyles.textCanceled
              ]}>
                Estoque: {produto.quantidade}
              </Text>
              {item.observacao && (
                <Text style={[
                  globalStyles.observationText,
                  item.cancelada && globalStyles.textCanceled
                ]}>
                  {item.observacao}
                </Text>
              )}
            </View>
          </View>
          
          <View style={globalStyles.itemActions}>
            <Text style={[
              globalStyles.dateText,
              item.cancelada && globalStyles.textCanceled
            ]}>
              {formatDate(item.data)}
            </Text>
            {!item.cancelada && (
              <TouchableOpacity
                style={globalStyles.actionButton}
                onPress={() => cancelEntry(item)}
              >
                <Ionicons name="close-circle" size={24} color="#F44336" />
              </TouchableOpacity>
            )}
            {item.cancelada && (
              <View style={globalStyles.canceledBadge}>
                <Text style={globalStyles.canceledText}>CANCELADA</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  // loading
  if (loading) {
    return (
      <View style={globalStyles.loadingContainer}>
        <Ionicons name="hourglass-outline" size={40} color="#4CAF50" />
        <Text style={globalStyles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.header}>
        <View style={globalStyles.headerSearchContainer}>
          <Ionicons name="search" size={20} color="#666" style={globalStyles.searchIcon} />
          <TextInput
            style={globalStyles.searchInput}
            placeholder="Buscar..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={globalStyles.refreshButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={globalStyles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#4CAF50']}
          />
        }
        ListEmptyComponent={
          <View style={globalStyles.emptyContainer}>
            <Ionicons name="arrow-down-circle-outline" size={60} color="#ccc" />
            <Text style={globalStyles.emptyText}>
              {search ? 'Nenhum resultado' : 'Sem entradas ainda'}
            </Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={[entradaStyles.entradaFab, produtos.length === 0 && globalStyles.fabDisabled]} 
        onPress={openModal}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal
        isVisible={showModal}
        onBackdropPress={() => setShowModal(false)}
        style={globalStyles.modal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={globalStyles.modalContent}>
          <Text style={globalStyles.modalTitle}>Nova Entrada</Text>

          <Text style={globalStyles.modalLabel}>Produto</Text>
          <View style={globalStyles.pickerContainer}>
            <Picker
              selectedValue={selectedProd}
              onValueChange={setSelectedProd}
              style={globalStyles.picker}
            >
              <Picker.Item label="Escolha um produto..." value="" />
              {produtos.map((prod) => (
                <Picker.Item
                  key={prod.id}
                  label={`${prod.nome} (${prod.quantidade} em estoque)`}
                  value={prod.id}
                />
              ))}
            </Picker>
          </View>

          <Text style={globalStyles.modalLabel}>Quantidade</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Ex: 10"
            value={qtd}
            onChangeText={setQtd}
            keyboardType="numeric"
          />

          <Text style={globalStyles.modalLabel}>Observação (opcional)</Text>
          <TextInput
            style={[globalStyles.input, globalStyles.textArea]}
            placeholder="Alguma observação..."
            value={obs}
            onChangeText={setObs}
            multiline
            numberOfLines={3}
          />

          <View style={globalStyles.modalButtons}>
            <TouchableOpacity
              style={[globalStyles.modalButton, globalStyles.modalCancelButton]}
              onPress={() => setShowModal(false)}
            >
              <Text style={globalStyles.modalCancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[globalStyles.modalButton, globalStyles.modalSaveButton]}
              onPress={handleSave}
            >
              <Text style={globalStyles.modalSaveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EntradaScreen;