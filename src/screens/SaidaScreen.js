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
import { saidaStyles } from '../styles/saidaStyles';

const styles = { ...globalStyles, ...saidaStyles };

const SaidaScreen = () => {
  const [saidas, setSaidas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  let [loading, setLoading] = useState(true);
  
  // form state
  const [formData, setFormData] = useState({
    produtoId: '',
    quantidade: '',
    observacao: '',
  });

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      let storedProdutos = await AsyncStorage.getItem('produtos');
      if (storedProdutos) {
        const produtosData = JSON.parse(storedProdutos);
        setProdutos(produtosData);
      } else {
        setProdutos([]);
      }

      const storedSaidas = await AsyncStorage.getItem('saidas');
      if (storedSaidas) {
        let saidasData = JSON.parse(storedSaidas);
        // ordenar por data - mais recente primeiro
        const saidasOrdenadas = saidasData.sort((a, b) => new Date(b.data) - new Date(a.data));
        setSaidas(saidasOrdenadas);
      } else {
        setSaidas([]);
      }
    } catch (error) {
      console.error('Erro carregar dados:', error);
      Alert.alert('Erro', 'Falha ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // salvar no storage
  const saveSaidas = async (newSaidas) => {
    try {

      const saidasOrdenadas = newSaidas.sort((a, b) => new Date(b.data) - new Date(a.data));
      await AsyncStorage.setItem('saidas', JSON.stringify(saidasOrdenadas));
      setSaidas(saidasOrdenadas);
    } catch (error) {
      console.error('Erro salvar:', error);
      throw error;
    }
  };

  // atualizar estoque
  const updateProdutoEstoque = async (produtoId, qtd) => {
    try {
      const storedProdutos = await AsyncStorage.getItem('produtos');
      if (storedProdutos) {
        const produtosAtuais = JSON.parse(storedProdutos);
        let produtosAtualizados = produtosAtuais.map(produto => {
          if (produto.id === produtoId) {
            const novaQtd = Math.max(0, produto.quantidade - qtd);
            return { ...produto, quantidade: novaQtd };
          }
          return produto;
        });
        
        await AsyncStorage.setItem('produtos', JSON.stringify(produtosAtualizados));
        setProdutos(produtosAtualizados);
        
        return produtosAtualizados;
      }
    } catch (error) {
      console.error('Erro update estoque:', error);
      throw error;
    }
  };

  const getProdutoById = (id) => {
    return produtos.find(produto => produto.id === id);
  };

  // filtro de busca
  const filteredSaidas = saidas.filter(saida => {
    if (!searchText.trim()) return true;
    
    const produto = getProdutoById(saida.produtoId);
    if (!produto) return false;
    
    return produto.nome.toLowerCase().includes(searchText.toLowerCase()) ||
           saida.observacao?.toLowerCase().includes(searchText.toLowerCase());
  });

  const openAddModal = () => {
    if (produtos.length === 0) {
      Alert.alert('Ops', 'Precisa cadastrar produtos primeiro');
      return;
    }
    
    let produtosComEstoque = produtos.filter(produto => produto.quantidade > 0);
    if (produtosComEstoque.length === 0) {
      Alert.alert('Sem estoque', 'Nenhum produto tem estoque disponível');
      return;
    }
    
    setFormData({
      produtoId: '',
      quantidade: '',
      observacao: '',
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.produtoId || !formData.quantidade) {
      Alert.alert('Erro', 'Selecione produto e quantidade');
      return;
    }

    let quantidade = parseInt(formData.quantidade);
    if (isNaN(quantidade) || quantidade <= 0) {
      Alert.alert('Erro', 'Quantidade inválida');
      return;
    }

    const produto = getProdutoById(formData.produtoId);
    if (!produto) {
      Alert.alert('Erro', 'Produto não encontrado');
      return;
    }

    if (produto.quantidade < quantidade) {
      Alert.alert(
        'Sem estoque', 
        `Não tem estoque suficiente.\n\nTem: ${produto.quantidade}\nPrecisa: ${quantidade}`
      );
      return;
    }

    try {
      const novaSaida = {
        id: Date.now().toString(),
        produtoId: formData.produtoId,
        quantidade: quantidade,
        observacao: formData.observacao.trim(),
        data: new Date().toISOString(),
        cancelada: false,
      };

      let newSaidas = [novaSaida, ...saidas];
      await saveSaidas(newSaidas);

      await updateProdutoEstoque(formData.produtoId, quantidade);

      setModalVisible(false);
      
      Alert.alert(
        'Pronto!',
        `${produto.nome}: -${quantidade}\nEstoque: ${produto.quantidade - quantidade}`
      );

      await loadData(); // reload
      
    } catch (error) {
      console.error('Erro registrar:', error);
      Alert.alert('Erro', 'Não deu certo, tenta de novo');
    }
  };

  function handleCancelSaida(saida) {
    if (saida.cancelada) {
      Alert.alert('Já cancelada', 'Esta saída já foi cancelada');
      return;
    }

    const produto = getProdutoById(saida.produtoId);
    if (!produto) {
      Alert.alert('Erro', 'Produto sumiu do sistema');
      return;
    }
    
    Alert.alert(
      'Cancelar?',
      `Cancelar saída de ${saida.quantidade} de "${produto.nome}"?\n\nAgora: ${produto.quantidade}\nDepois: ${produto.quantidade + saida.quantidade}`,
      [
        { text: 'Não' },
        {
          text: 'Sim',
          onPress: async () => {
            try {
              // marcar cancelada
              const newSaidas = saidas.map(s => 
                s.id === saida.id ? { ...s, cancelada: true } : s
              );
              await saveSaidas(newSaidas);

              // devolver estoque
              await updateProdutoEstoque(saida.produtoId, -saida.quantidade);

              Alert.alert('Ok', 'Cancelado e estoque devolvido');
 
              await loadData();
              
            } catch (error) {
              console.error('Erro cancelar:', error);
              Alert.alert('Erro', 'Não conseguiu cancelar');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Data bugada';
    }
  };

  const renderSaida = ({ item }) => {
    let produto = getProdutoById(item.produtoId);
    
    if (!produto) {
      return (
        <View style={[styles.itemCard, styles.itemCardError]}>
          <Text style={styles.errorText}>Produto não existe mais</Text>
          <Text style={styles.errorSubText}>ID: {item.produtoId}</Text>
        </View>
      );
    }

    return (
      <View style={[
        styles.itemCard,
        item.cancelada && styles.itemCardCanceled
      ]}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            {produto.foto ? (
              <Image source={{ uri: produto.foto }} style={styles.produtoImage} />
            ) : (
              <View style={styles.noImage}>
                <Ionicons name="cube-outline" size={20} color="#ccc" />
              </View>
            )}
            <View style={styles.itemDetails}>
              <Text style={[
                styles.produtoNome,
                item.cancelada && styles.textCancelado
              ]}>
                {produto.nome}
              </Text>
              <Text style={[
                styles.quantidadeText,
                item.cancelada && styles.textCancelado
              ]}>
                -{item.quantidade} unidades
              </Text>
              <Text style={[
                styles.estoqueAtualText,
                item.cancelada && styles.textCancelado
              ]}>
                Estoque: {produto.quantidade}
              </Text>
              {item.observacao ? (
                <Text style={[
                  styles.observationText,
                  item.cancelada && styles.textCancelado
                ]}>
                  {item.observacao}
                </Text>
              ) : null}
            </View>
          </View>
          
          <View style={styles.itemActions}>
            <Text style={[
              styles.dataText,
              item.cancelada && styles.textCancelado
            ]}>
              {formatDate(item.data)}
            </Text>
            {!item.cancelada && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleCancelSaida(item)}
              >
                <Ionicons name="close-circle" size={24} color="#F44336" />
              </TouchableOpacity>
            )}
            {item.cancelada && (
              <View style={styles.canceledBadge}>
                <Text style={styles.canceledText}>CANCELADA</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="hourglass-outline" size={40} color="#FF5722" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color="#FF5722" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredSaidas}
        keyExtractor={(item) => item.id}
        renderItem={renderSaida}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF5722']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="arrow-up-circle-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchText ? 'Nada encontrado' : 'Nenhuma saída ainda'}
            </Text>
            {searchText && (
              <Text style={styles.emptySubText}>
                Tenta outro termo
              </Text>
            )}
          </View>
        }
      />

      <TouchableOpacity 
        style={[styles.fab, produtos.length === 0 && styles.fabDisabled]} 
        onPress={openAddModal}
      >
        <Ionicons name="remove" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        style={styles.modal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Nova Saída</Text>

          <Text style={styles.label}>Produto</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.produtoId}
              onValueChange={(value) => setFormData({ ...formData, produtoId: value })}
              style={styles.picker}
            >
              <Picker.Item label="Escolha um produto..." value="" />
              {produtos
                .filter(produto => produto.quantidade > 0)
                .map((produto) => (
                <Picker.Item
                  key={produto.id}
                  label={`${produto.nome} (${produto.quantidade})`}
                  value={produto.id}
                />
              ))}
            </Picker>
          </View>

          {formData.produtoId && (
            <View style={styles.estoqueInfo}>
              <Text style={styles.estoqueInfoText}>
                Tem: {getProdutoById(formData.produtoId)?.quantidade || 0} unidades
              </Text>
            </View>
          )}

          <Text style={styles.label}>Quantidade</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 10"
            value={formData.quantidade}
            onChangeText={(text) => setFormData({ ...formData, quantidade: text })}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Observação</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Alguma observação..."
            value={formData.observacao}
            onChangeText={(text) => setFormData({ ...formData, observacao: text })}
            multiline
            numberOfLines={3}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SaidaScreen;