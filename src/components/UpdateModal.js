import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Linking,
} from 'react-native';
import { theme } from '../styles/theme';

const { width } = Dimensions.get('window');

export const UpdateModal = ({ visible, updateData, onDismiss }) => {

    const handleDownloadInBrowser = () => {
        if (updateData?.downloadUrl) {
            Linking.openURL(updateData.downloadUrl);
        }
    };

    if (!updateData) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onDismiss}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>🚀 Update Available!</Text>
                    <Text style={styles.version}>Version {updateData.latestVersion}</Text>

                    <View style={styles.notesContainer}>
                        <Text style={styles.notesTitle}>What's New:</Text>
                        <Text style={styles.notesText}>{updateData.releaseNotes}</Text>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.button, styles.skipButton]}
                            onPress={onDismiss}
                        >
                            <Text style={styles.skipText}>Skip for now</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.updateButton]}
                            onPress={handleDownloadInBrowser}
                        >
                            <Text style={styles.updateText}>⬇ Download</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.hint}>
                        Opens in browser. After download, tap the APK to install.
                    </Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: width * 0.85,
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.xl,
        elevation: 5,
    },
    title: {
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
        textAlign: 'center',
    },
    version: {
        fontSize: theme.fontSize.md,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: theme.spacing.xs,
        marginBottom: theme.spacing.lg,
    },
    notesContainer: {
        backgroundColor: theme.colors.background,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.lg,
    },
    notesTitle: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    notesText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
        lineHeight: 18,
    },
    actions: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.sm,
    },
    button: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
    },
    skipButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    updateButton: {
        backgroundColor: theme.colors.primary,
    },
    skipText: {
        color: theme.colors.textSecondary,
        fontWeight: theme.fontWeight.semibold,
    },
    updateText: {
        color: '#fff',
        fontWeight: theme.fontWeight.bold,
    },
    hint: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: theme.spacing.xs,
        lineHeight: 16,
        fontStyle: 'italic',
    },
});
