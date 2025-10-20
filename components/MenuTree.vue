<template>
  <v-list density="comfortable" class="pa-0">
    <template v-for="n in nodes" :key="n.id">
      <v-list-item>
        <template #prepend>
          <v-icon class="mr-2" :icon="n.icon || 'mdi-dots-horizontal-circle-outline'"></v-icon>
        </template>

        <v-list-item-title class="font-weight-600">{{ n.name }}</v-list-item-title>
        <v-list-item-subtitle class="text-caption">{{ n.url || '-' }}</v-list-item-subtitle>

        <template #append>
          <v-switch
            :model-value="n.is_active"
            inset color="success" hide-details
            @update:model-value="$emit('toggle-active', n, $event)"
          />
          <v-btn icon size="small" class="ml-1" @click="$emit('add-child', n)">
            <v-icon size="18">mdi-plus</v-icon>
          </v-btn>
          <v-btn icon size="small" @click="$emit('edit', n)">
            <v-icon size="18" color="primary">mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon size="small" @click="$emit('delete', n)">
            <v-icon size="18" color="error">mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-list-item>

      <div v-if="n.children && n.children.length" class="ml-8">
        <!-- self-recursive call -->
        <MenuTree
          :nodes="n.children"
          @edit="$emit('edit', $event)"
          @add-child="$emit('add-child', $event)"
          @delete="$emit('delete', $event)"
          @toggle-active="$emit('toggle-active', ...arguments)"
        />
      </div>
      <v-divider class="my-2" />
    </template>
  </v-list>
</template>

<script setup lang="ts">
type MenuNode = {
  id: number
  name: string
  url?: string | null
  icon?: string
  is_active: boolean
  parent_id?: number | null
  children?: MenuNode[]
}

defineProps<{ nodes: MenuNode[] }>()
defineEmits<{
  (e: 'edit', node: MenuNode): void
  (e: 'add-child', node: MenuNode): void
  (e: 'delete', node: MenuNode): void
  (e: 'toggle-active', node: MenuNode, next: boolean): void
}>()
</script>
