import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Typography,
  Box,
  IconButton
} from '@mui/material';
import { Close as CloseIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';

function ProfileEditModal({
  open,
  onClose,
  user,
  editForm,
  setEditForm,
  handleImageChange,
  handleUpdateProfile
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: '16px',
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
        プロフィール編集
        <IconButton
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={3} py={1}>
          <TextField
            label="名前"
            required
            fullWidth
            value={editForm.name}
            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
            variant="outlined"
            sx={{ '& .MuiInputBase-root': { height: '64px' } }}
          />

          <TextField
            label="ユーザー名"
            required
            fullWidth
            value={editForm.username}
            onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
            variant="outlined"
            sx={{ '& .MuiInputBase-root': { height: '64px' } }}
          />

          <TextField
            label="自己紹介"
            fullWidth
            multiline
            rows={3}
            value={editForm.bio}
            onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="自己紹介を入力してください"
            variant="outlined"
          />

          <TextField
            label="ウェブサイト"
            fullWidth
            type="url"
            value={editForm.website}
            onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
            placeholder="https://example.com"
            variant="outlined"
          />

          {/* いいね公開範囲 */}
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              ❤️ いいね欄の公開範囲
            </FormLabel>
            <RadioGroup
              value={editForm.likes_visibility ?? 'public'}
              onChange={(e) => setEditForm(prev => ({ ...prev, likes_visibility: e.target.value }))}
            >
              <FormControlLabel value="public" control={<Radio />} label="全員に公開" />
              <FormControlLabel value="followers" control={<Radio />} label="フォロワーのみに公開" />
              <FormControlLabel value="private" control={<Radio />} label="非公開（自分のみ）" />
            </RadioGroup>
          </FormControl>

          {/* 日本地図公開範囲 */}
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              🗾 日本地図の公開範囲
            </FormLabel>
            <RadioGroup
              value={editForm.map_visibility ?? 'public'}
              onChange={(e) => setEditForm(prev => ({ ...prev, map_visibility: e.target.value }))}
            >
              <FormControlLabel value="public" control={<Radio />} label="全員に公開" />
              <FormControlLabel value="followers" control={<Radio />} label="フォロワーのみに公開" />
              <FormControlLabel value="private" control={<Radio />} label="非公開（自分のみ）" />
            </RadioGroup>
          </FormControl>

          <Box>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              プライバシー設定
            </Typography>
            <Box display="flex" flexDirection="column" gap={1} pl={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editForm.privacy_settings.show_followers}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      privacy_settings: {
                        ...prev.privacy_settings,
                        show_followers: e.target.checked
                      }
                    }))}
                    color="primary"
                  />
                }
                label="フォロワーリストを公開する"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={editForm.privacy_settings.show_followings}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      privacy_settings: {
                        ...prev.privacy_settings,
                        show_followings: e.target.checked
                      }
                    }))}
                    color="primary"
                  />
                }
                label="フォロー中リストを公開する"
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              プロフィール画像
            </Typography>
            <Box display="flex" gap={2} alignItems="flex-start" mt={1}>
              <Box flex={1}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  現在の画像:
                </Typography>
                <img
                  src={user?.profile_image_url || '/images/default-avatar.svg'}
                  alt="現在のプロフィール画像"
                  className="current-profile-image"
                  style={{ width: 100, height: 100, borderRadius: 8, objectFit: 'cover', border: '1px solid #e0e0e0' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/default-avatar.svg';
                  }}
                />
              </Box>
              <Box flex={1}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  新しい画像を選択:
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  画像を選択
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
                <Typography variant="caption" color="textSecondary" display="block">
                  • 対応形式: JPEG, PNG, JPG, GIF
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                  • 最大サイズ: 20MB
                </Typography>

                {editForm.profile_image_preview && (
                  <Box mt={2}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      プレビュー:
                    </Typography>
                    <img
                      src={editForm.profile_image_preview}
                      alt="プレビュー"
                      style={{ width: 100, height: 100, borderRadius: 8, objectFit: 'cover', border: '1px solid #e0e0e0' }}
                    />
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          color="inherit"
        >
          キャンセル
        </Button>
        <Button
          onClick={handleUpdateProfile}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: 'white',
            boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.4)',
            '&:hover': {
              filter: 'brightness(1.1)',
              boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.5)',
            }
          }}
        >
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ProfileEditModal;
