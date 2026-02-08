import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ProgressBarAndroid,
    Dimensions,
} from 'react-native';
import { theme } from '../styles/theme';
import { downloadAndInstallUpdate } from '../services/updateHandler';

const { width } = Dimensions.get('window');

export const UpdateModal = ({ visible, updateData, onDismiss }) => {
    const [downloading, setDownloading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleUpdate = async () => {
        setDownloading(true);
        const success = await downloadAndInstallUpdate(updateData.downloadUrl, (p) => {
            setProgress(p);
        });

        if (!success) {
            setDownloading(false);
            setProgress(0);
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

                    {downloading ? (
                        <View style={styles.progressContainer}>
                            <Text style={styles.progressText}>
                                Downloading... {Math.round(progress * 100)}%
                            </Text>
                            <ProgressBarAndroid
                                styleAttr="Horizontal"
                                indeterminate={false}
                                progress={progress}
                                color={theme.colors.primary}
                            />
                        </View>
                    ) : (
                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={[styles.button, styles.skipButton]}
                                onPress={onDismiss}
                            >
                                <Text style={styles.skipText}>Skip for now</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.updateButton]}
                                onPress={handleUpdate}
                            >
                                <Text style={styles.updateText}>Update Now</Text>
                            </TouchableOpacity>
                        </View>
                    )}
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
        marginBottom: theme.spacing.xl,
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
        marginTop: theme.spacing.md,
    },
    progressText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: theme.spacing.xs,
    },
    actions: {
        flexDirection: 'row',
        gap: theme.spacing.md,
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
});
