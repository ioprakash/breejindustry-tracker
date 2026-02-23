import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    Modal,
    FlatList,
    Alert,
    RefreshControl,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';
import { formatNumber } from '../utils/calculations';
import {
    getLedgerParties,
    addLedgerParty,
    getLedgerEntries,
    addLedgerEntry,
    updateLedgerEntry,
} from '../services/api';

// ─── Main Screen ──────────────────────────────────────────────────
export const LedgerScreen = ({ navigation }) => {
    const [parties, setParties] = useState([]);
    const [selectedParty, setSelectedParty] = useState(null);
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Modals
    const [addPartyModalVisible, setAddPartyModalVisible] = useState(false);
    const [selectPartyModalVisible, setSelectPartyModalVisible] = useState(false);
    const [entryFormVisible, setEntryFormVisible] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);

    // New party form
    const [newPartyName, setNewPartyName] = useState('');
    const [addingParty, setAddingParty] = useState(false);

    // Entry form
    const [entryForm, setEntryForm] = useState({
        date: new Date().toISOString().split('T')[0],
        type: 'DR',
        amount: '',
        description: '',
        remark: '',
    });
    const [submitting, setSubmitting] = useState(false);

    // ─── Load Parties ────────────────────────────────────────
    const loadParties = useCallback(async () => {
        try {
            const result = await getLedgerParties();
            if (result && result.length > 0) {
                setParties(result);
            }
        } catch (err) {
            console.error('Error loading parties:', err);
        }
    }, []);

    // ─── Load Entries for Selected Party ─────────────────────
    const loadEntries = useCallback(async (partyName) => {
        if (!partyName) return;
        setLoading(true);
        try {
            const result = await getLedgerEntries(partyName);
            if (result) {
                setEntries(result);
            }
        } catch (err) {
            console.error('Error loading entries:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadParties();
    }, [loadParties]);

    useEffect(() => {
        if (selectedParty) {
            loadEntries(selectedParty);
        }
    }, [selectedParty, loadEntries]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadParties();
        if (selectedParty) {
            await loadEntries(selectedParty);
        }
        setRefreshing(false);
    };

    // ─── Add Party ───────────────────────────────────────────
    const handleAddParty = async () => {
        const trimmed = newPartyName.trim();
        if (!trimmed) {
            Alert.alert('Error', 'Please enter party name');
            return;
        }
        if (parties.includes(trimmed)) {
            Alert.alert('Error', 'Party already exists');
            return;
        }
        setAddingParty(true);
        try {
            const result = await addLedgerParty(trimmed);
            if (result.success) {
                setParties(prev => [...prev, trimmed]);
                setNewPartyName('');
                setAddPartyModalVisible(false);
                setSelectedParty(trimmed);
                Alert.alert('Success', `Party "${trimmed}" added successfully`);
            } else {
                Alert.alert('Error', result.error || 'Failed to add party');
            }
        } catch (err) {
            Alert.alert('Error', 'Something went wrong');
        } finally {
            setAddingParty(false);
        }
    };

    // ─── Submit Entry ────────────────────────────────────────
    const handleSubmitEntry = async () => {
        if (!entryForm.amount || !entryForm.description) {
            Alert.alert('Error', 'Please fill in Amount and Description');
            return;
        }
        if (!selectedParty) {
            Alert.alert('Error', 'Please select a party first');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                ...entryForm,
                partyName: selectedParty,
                amount: parseFloat(entryForm.amount).toFixed(2),
            };

            let result;
            if (editingEntry) {
                result = await updateLedgerEntry(editingEntry.actualEntryTime, payload);
            } else {
                result = await addLedgerEntry(payload);
            }

            if (result.success) {
                Alert.alert(
                    'Success',
                    editingEntry ? 'Entry updated successfully' : 'Entry added successfully'
                );
                // Reset form
                setEntryForm({
                    date: new Date().toISOString().split('T')[0],
                    type: 'DR',
                    amount: '',
                    description: '',
                    remark: '',
                });
                setEditingEntry(null);
                setEntryFormVisible(false);
                // Reload entries
                await loadEntries(selectedParty);
            } else {
                Alert.alert('Error', result.error || 'Failed to save entry');
            }
        } catch (err) {
            Alert.alert('Error', 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Edit Entry ──────────────────────────────────────────
    const handleEditEntry = (entry) => {
        setEditingEntry(entry);
        setEntryForm({
            date: entry.date || new Date().toISOString().split('T')[0],
            type: entry.type || 'DR',
            amount: entry.amount ? entry.amount.toString() : '',
            description: entry.description || '',
            remark: entry.remark || '',
        });
        setEntryFormVisible(true);
    };

    // ─── Calculate Running Balance ──────────────────────────
    const getEntriesWithBalance = () => {
        let balance = 0;
        return entries.map(entry => {
            const amt = parseFloat(entry.amount) || 0;
            if (entry.type === 'DR') {
                balance += amt;
            } else {
                balance -= amt;
            }
            return { ...entry, runningBalance: balance };
        });
    };

    const totalDR = entries.reduce((sum, e) => sum + (e.type === 'DR' ? (parseFloat(e.amount) || 0) : 0), 0);
    const totalCR = entries.reduce((sum, e) => sum + (e.type === 'CR' ? (parseFloat(e.amount) || 0) : 0), 0);
    const finalBalance = totalDR - totalCR;
    const entriesWithBalance = getEntriesWithBalance();

    // ═══════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#6366f1', '#4f46e5', '#4338ca']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerDecor1} />
                <View style={styles.headerDecor2} />
                <Text style={styles.headerTitle}>📒 Ledger</Text>
                <Text style={styles.headerSubtitle}>Party-wise account management</Text>
            </LinearGradient>

            {/* Action Buttons */}
            <View style={styles.actionBar}>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.addPartyBtn]}
                    onPress={() => setAddPartyModalVisible(true)}
                >
                    <Text style={styles.actionBtnText}>➕ Add Party</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.selectPartyBtn]}
                    onPress={() => setSelectPartyModalVisible(true)}
                >
                    <Text style={styles.actionBtnText}>
                        {selectedParty ? `📋 ${selectedParty}` : '📋 Select Party'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Party Summary Card */}
            {selectedParty && (
                <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Total DR</Text>
                            <Text style={[styles.summaryValue, { color: theme.colors.danger }]}>
                                ₹{formatNumber(totalDR)}
                            </Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Total CR</Text>
                            <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
                                ₹{formatNumber(totalCR)}
                            </Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Balance</Text>
                            <Text style={[styles.summaryValue, { color: finalBalance >= 0 ? theme.colors.danger : theme.colors.success }]}>
                                ₹{formatNumber(Math.abs(finalBalance))}
                                {finalBalance >= 0 ? ' DR' : ' CR'}
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Entries List */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
                showsVerticalScrollIndicator={false}
            >
                {!selectedParty ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📋</Text>
                        <Text style={styles.emptyText}>Select a party to view ledger entries</Text>
                        <Text style={styles.emptySubText}>Use the buttons above to add or select a party</Text>
                    </View>
                ) : loading ? (
                    <View style={styles.emptyContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={styles.emptyText}>Loading entries...</Text>
                    </View>
                ) : entriesWithBalance.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📝</Text>
                        <Text style={styles.emptyText}>No entries for {selectedParty}</Text>
                        <Text style={styles.emptySubText}>Tap the + button to add a new entry</Text>
                    </View>
                ) : (
                    <>
                        {/* Table Header */}
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>Date</Text>
                            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Description</Text>
                            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>DR</Text>
                            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>CR</Text>
                            <Text style={[styles.tableHeaderText, { flex: 1.3, textAlign: 'right' }]}>Balance</Text>
                        </View>

                        {entriesWithBalance.map((entry, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.entryRow, index % 2 === 0 && styles.entryRowAlt]}
                                onPress={() => handleEditEntry(entry)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.entryCellText, { flex: 1.2 }]} numberOfLines={1}>
                                    {entry.date || 'N/A'}
                                </Text>
                                <View style={{ flex: 2 }}>
                                    <Text style={styles.entryCellText} numberOfLines={1}>
                                        {entry.description || 'N/A'}
                                    </Text>
                                    {entry.remark ? (
                                        <Text style={styles.entryRemark} numberOfLines={1}>
                                            {entry.remark}
                                        </Text>
                                    ) : null}
                                </View>
                                <Text style={[styles.entryCellText, { flex: 1, textAlign: 'right', color: entry.type === 'DR' ? theme.colors.danger : theme.colors.textMuted }]}>
                                    {entry.type === 'DR' ? formatNumber(entry.amount) : '-'}
                                </Text>
                                <Text style={[styles.entryCellText, { flex: 1, textAlign: 'right', color: entry.type === 'CR' ? theme.colors.success : theme.colors.textMuted }]}>
                                    {entry.type === 'CR' ? formatNumber(entry.amount) : '-'}
                                </Text>
                                <Text style={[styles.entryCellText, {
                                    flex: 1.3,
                                    textAlign: 'right',
                                    fontWeight: theme.fontWeight.bold,
                                    color: entry.runningBalance >= 0 ? theme.colors.danger : theme.colors.success,
                                }]}>
                                    {formatNumber(Math.abs(entry.runningBalance))}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <Text style={styles.editHint}>Tap any entry to edit ✏️</Text>
                    </>
                )}
            </ScrollView>

            {/* Floating Add Button */}
            {selectedParty && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => {
                        setEditingEntry(null);
                        setEntryForm({
                            date: new Date().toISOString().split('T')[0],
                            type: 'DR',
                            amount: '',
                            description: '',
                            remark: '',
                        });
                        setEntryFormVisible(true);
                    }}
                    activeOpacity={0.85}
                >
                    <LinearGradient
                        colors={['#6366f1', '#4f46e5']}
                        style={styles.fabGradient}
                    >
                        <Text style={styles.fabText}>+ Add Entry</Text>
                    </LinearGradient>
                </TouchableOpacity>
            )}

            {/* ════════════ Add Party Modal ══════════════════ */}
            <Modal
                visible={addPartyModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setAddPartyModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>➕ Add New Party</Text>
                            <TouchableOpacity onPress={() => setAddPartyModalVisible(false)}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalBody}>
                            <Text style={styles.inputLabel}>Party Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter party name..."
                                placeholderTextColor={theme.colors.textMuted}
                                value={newPartyName}
                                onChangeText={setNewPartyName}
                                autoFocus
                            />
                            <TouchableOpacity
                                style={[styles.submitBtn, addingParty && styles.submitBtnDisabled]}
                                onPress={handleAddParty}
                                disabled={addingParty}
                            >
                                {addingParty ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitBtnText}>Add Party</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ════════════ Select Party Modal ════════════════ */}
            <Modal
                visible={selectPartyModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setSelectPartyModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { maxHeight: '70%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>📋 Select Party</Text>
                            <TouchableOpacity onPress={() => setSelectPartyModalVisible(false)}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        {parties.length === 0 ? (
                            <View style={styles.modalEmpty}>
                                <Text style={styles.emptyText}>No parties added yet</Text>
                                <TouchableOpacity
                                    style={styles.submitBtn}
                                    onPress={() => {
                                        setSelectPartyModalVisible(false);
                                        setAddPartyModalVisible(true);
                                    }}
                                >
                                    <Text style={styles.submitBtnText}>Add First Party</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <FlatList
                                data={parties}
                                keyExtractor={(item, index) => `${item}-${index}`}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.partyItem,
                                            selectedParty === item && styles.partyItemActive,
                                        ]}
                                        onPress={() => {
                                            setSelectedParty(item);
                                            setSelectPartyModalVisible(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.partyItemText,
                                            selectedParty === item && styles.partyItemTextActive,
                                        ]}>
                                            {item}
                                        </Text>
                                        {selectedParty === item && (
                                            <Text style={styles.checkIcon}>✓</Text>
                                        )}
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                    </View>
                </View>
            </Modal>

            {/* ════════════ Entry Form Modal ══════════════════ */}
            <Modal
                visible={entryFormVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {
                    setEntryFormVisible(false);
                    setEditingEntry(null);
                }}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { maxHeight: '85%' }]}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    {editingEntry ? '✏️ Edit Entry' : '➕ New Entry'}
                                </Text>
                                <TouchableOpacity onPress={() => {
                                    setEntryFormVisible(false);
                                    setEditingEntry(null);
                                }}>
                                    <Text style={styles.closeButton}>✕</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={styles.modalBody}>
                                <Text style={styles.formPartyName}>Party: {selectedParty}</Text>

                                {/* Date */}
                                <Text style={styles.inputLabel}>Date</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor={theme.colors.textMuted}
                                    value={entryForm.date}
                                    onChangeText={(val) => setEntryForm({ ...entryForm, date: val })}
                                />

                                {/* DR / CR Toggle */}
                                <Text style={styles.inputLabel}>Type</Text>
                                <View style={styles.typeToggle}>
                                    <TouchableOpacity
                                        style={[styles.typeBtn, entryForm.type === 'DR' && styles.typeBtnDR]}
                                        onPress={() => setEntryForm({ ...entryForm, type: 'DR' })}
                                    >
                                        <Text style={[styles.typeBtnText, entryForm.type === 'DR' && styles.typeBtnTextActive]}>
                                            DR (Debit)
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.typeBtn, entryForm.type === 'CR' && styles.typeBtnCR]}
                                        onPress={() => setEntryForm({ ...entryForm, type: 'CR' })}
                                    >
                                        <Text style={[styles.typeBtnText, entryForm.type === 'CR' && styles.typeBtnTextActive]}>
                                            CR (Credit)
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Amount */}
                                <Text style={styles.inputLabel}>Amount</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0.00"
                                    placeholderTextColor={theme.colors.textMuted}
                                    keyboardType="numeric"
                                    value={entryForm.amount}
                                    onChangeText={(val) => setEntryForm({ ...entryForm, amount: val })}
                                />

                                {/* Description */}
                                <Text style={styles.inputLabel}>Description *</Text>
                                <TextInput
                                    style={[styles.input, styles.inputMultiline]}
                                    placeholder="Enter description..."
                                    placeholderTextColor={theme.colors.textMuted}
                                    value={entryForm.description}
                                    onChangeText={(val) => setEntryForm({ ...entryForm, description: val })}
                                    multiline
                                    numberOfLines={3}
                                />

                                {/* Remark */}
                                <Text style={styles.inputLabel}>Remark</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Optional remark..."
                                    placeholderTextColor={theme.colors.textMuted}
                                    value={entryForm.remark}
                                    onChangeText={(val) => setEntryForm({ ...entryForm, remark: val })}
                                />

                                <TouchableOpacity
                                    style={[styles.submitBtn, submitting && styles.submitBtnDisabled, { marginBottom: 30 }]}
                                    onPress={handleSubmitEntry}
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.submitBtnText}>
                                            {editingEntry ? 'Update Entry' : 'Save Entry'}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
};

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        paddingTop: theme.spacing.lg,
        paddingBottom: theme.spacing.lg,
        paddingHorizontal: theme.spacing.lg,
        overflow: 'hidden',
        position: 'relative',
    },
    headerDecor1: {
        position: 'absolute',
        top: -30,
        right: -20,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    headerDecor2: {
        position: 'absolute',
        bottom: -15,
        left: -15,
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    headerTitle: {
        fontSize: theme.fontSize.xxl,
        fontWeight: theme.fontWeight.bold,
        color: '#fff',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: theme.fontSize.md,
        color: 'rgba(255, 255, 255, 0.8)',
    },

    // Action Bar
    actionBar: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        ...theme.shadows.sm,
    },
    addPartyBtn: {
        backgroundColor: '#10b981',
    },
    selectPartyBtn: {
        backgroundColor: theme.colors.primary,
    },
    actionBtnText: {
        color: '#fff',
        fontWeight: theme.fontWeight.bold,
        fontSize: theme.fontSize.sm,
    },

    // Summary Card
    summaryCard: {
        marginHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.sm,
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        ...theme.shadows.md,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryDivider: {
        width: 1,
        height: 40,
        backgroundColor: theme.colors.border,
    },
    summaryLabel: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textMuted,
        marginBottom: 4,
        fontWeight: theme.fontWeight.medium,
    },
    summaryValue: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.bold,
    },

    // Entries
    scrollContent: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: 100,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: theme.colors.primaryDark,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderTopLeftRadius: theme.borderRadius.md,
        borderTopRightRadius: theme.borderRadius.md,
        marginTop: theme.spacing.sm,
    },
    tableHeaderText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: theme.fontWeight.bold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    entryRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 8,
        backgroundColor: theme.colors.card,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
        alignItems: 'center',
    },
    entryRowAlt: {
        backgroundColor: theme.colors.cardLight,
    },
    entryCellText: {
        fontSize: 11,
        color: theme.colors.text,
    },
    entryRemark: {
        fontSize: 9,
        color: theme.colors.textMuted,
        fontStyle: 'italic',
        marginTop: 2,
    },
    editHint: {
        fontSize: 10,
        color: theme.colors.primary,
        fontStyle: 'italic',
        textAlign: 'right',
        marginTop: 8,
    },

    // Empty
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.xxl * 2,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: theme.spacing.md,
    },
    emptyText: {
        textAlign: 'center',
        color: theme.colors.textMuted,
        fontSize: theme.fontSize.md,
        marginBottom: 4,
    },
    emptySubText: {
        textAlign: 'center',
        color: theme.colors.textMuted,
        fontSize: theme.fontSize.sm,
    },

    // FAB
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 20,
        borderRadius: theme.borderRadius.full,
        ...theme.shadows.lg,
    },
    fabGradient: {
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: theme.borderRadius.full,
    },
    fabText: {
        color: '#fff',
        fontWeight: theme.fontWeight.bold,
        fontSize: theme.fontSize.md,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        padding: theme.spacing.lg,
    },
    modalContent: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden',
        ...theme.shadows.xl,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.cardLight,
    },
    modalTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
    },
    closeButton: {
        fontSize: theme.fontSize.lg,
        color: theme.colors.textSecondary,
        padding: theme.spacing.xs,
    },
    modalBody: {
        padding: theme.spacing.lg,
    },
    modalEmpty: {
        padding: theme.spacing.xl,
        alignItems: 'center',
    },

    // Form
    formPartyName: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.primary,
        marginBottom: theme.spacing.md,
        backgroundColor: theme.colors.primarySoft,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: theme.borderRadius.sm,
    },
    inputLabel: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.medium,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
        marginTop: theme.spacing.sm,
    },
    input: {
        backgroundColor: theme.colors.cardLight,
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.sm,
        padding: theme.spacing.md,
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
    },
    inputMultiline: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    typeToggle: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.xs,
    },
    typeBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: theme.borderRadius.md,
        borderWidth: 2,
        borderColor: theme.colors.border,
        alignItems: 'center',
        backgroundColor: theme.colors.cardLight,
    },
    typeBtnDR: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: theme.colors.danger,
    },
    typeBtnCR: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: theme.colors.success,
    },
    typeBtnText: {
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.textSecondary,
        fontSize: theme.fontSize.sm,
    },
    typeBtnTextActive: {
        color: theme.colors.text,
    },

    submitBtn: {
        backgroundColor: '#6366f1',
        paddingVertical: 14,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        marginTop: theme.spacing.lg,
    },
    submitBtnDisabled: {
        opacity: 0.6,
    },
    submitBtnText: {
        color: '#fff',
        fontWeight: theme.fontWeight.bold,
        fontSize: theme.fontSize.md,
    },

    // Party list items
    partyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    partyItemActive: {
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
    },
    partyItemText: {
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
    },
    partyItemTextActive: {
        color: '#6366f1',
        fontWeight: theme.fontWeight.semibold,
    },
    checkIcon: {
        color: '#6366f1',
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
    },
});
