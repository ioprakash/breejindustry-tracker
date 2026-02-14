import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { theme } from '../styles/theme';
import { downloadAndInstallUpdate, openInBrowser } from '../services/updateHandler';

const { width } = Dimensions.get('window');

export const UpdateModal = ({ visible, updateData, onDismiss }) => {
    const [downloading, setDownloading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleSilentInstall = async () => {
        if (!updateData?.downloadUrl) return;
        setDownloading(true);
        setProgress(0);
        const success = await downloadAndInstallUpdate(updateData.downloadUrl, (p) => {
            setProgress(p);
        });
        setDownloading(false);
        if (success) {
            onDismiss();
        }
    };

    const handleBrowserDownload = () => {
        if (updateData?.downloadUrl) {
            openInBrowser(updateData.downloadUrl);
            onDismiss();
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

                    {/* Download Progress */}
                    {downloading && (
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${Math.round(progress * 100)}%` }]} />
                            </View>
                            <Text style={styles.progressText}>
                                Downloading... {Math.round(progress * 100)}%
                            </Text>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.actions}>
                        {/* Skip Button */}
                        <TouchableOpacity
                            style={[styles.button, styles.skipButton]}
                            onPress={onDismiss}
                            disabled={downloading}
                        >
                            <Text style={[styles.skipText, downloading && styles.disabledText]}>Skip</Text>
                        </TouchableOpacity>

                        {/* Silent Install Button */}
                        <TouchableOpacity
                            style={[styles.button, styles.silentButton, downloading && styles.disabledButton]}
                            onPress={handleSilentInstall}
                            disabled={downloading}
                        >
                            <Text style={styles.buttonText}>
                                {downloading ? '⏳ Installing...' : '⬇ Silent Install'}
                            </Text>
                        </TouchableOpacity>

                        {/* Browser Download Button */}
                        <TouchableOpacity
                            style={[styles.button, styles.browserButton, downloading && styles.disabledButton]}
                            onPress={handleBrowserDownload}
                            disabled={downloading}
                        >
                            <Text style={styles.buttonText}>🌐 Browser</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.hint}>
                        Silent Install downloads directly. Browser opens in your browser.
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
        width: width * 0.88,
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
    progressContainer: {
        marginBottom: theme.spacing.md,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: theme.colors.borderLight || '#e5e7eb',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: theme.colors.primary,
        borderRadius: 4,
    },
    progressText: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.primary,
        textAlign: 'center',
        marginTop: theme.spacing.xs,
        fontWeight: theme.fontWeight.semibold,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: theme.spacing.sm,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.border,
        flex: 0.7,
    },
    silentButton: {
        backgroundColor: theme.colors.primary,
        flex: 1.3,
    },
    browserButton: {
        backgroundColor: theme.colors.secondary || '#6366f1',
        flex: 1,
    },
    skipText: {
        color: theme.colors.textSecondary,
        fontWeight: theme.fontWeight.semibold,
        fontSize: theme.fontSize.sm,
    },
    buttonText: {
        color: '#fff',
        fontWeight: theme.fontWeight.bold,
        fontSize: theme.fontSize.sm,
    },
    disabledButton: {
        opacity: 0.5,
    },
    disabledText: {
        opacity: 0.5,
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
