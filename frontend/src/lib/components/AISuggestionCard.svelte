<script lang="ts">
	import { Sparkles, TrendingUp, Brain, CheckCircle, ChevronDown, ChevronRight } from '@lucide/svelte';
	import type { CryptoSuggestion, AISuggestionResponse } from '$lib/services/aiSuggestionService';

	interface Props {
		suggestions: AISuggestionResponse | null;
		loading: boolean;
		error: string | null;
		onAccept: (cryptos: string[]) => void;
		onRequestSuggestions: () => void;
	}

	let { suggestions, loading, error, onAccept, onRequestSuggestions }: Props = $props();
	
	// Track which suggestions are expanded
	let expandedItems = $state<Set<number>>(new Set());

	function toggleItem(index: number) {
		const newExpanded = new Set(expandedItems);
		if (newExpanded.has(index)) {
			newExpanded.delete(index);
		} else {
			newExpanded.add(index);
		}
		expandedItems = newExpanded;
	}

	function handleAcceptAll() {
		if (suggestions?.suggestions) {
			const cryptos = suggestions.suggestions.map(s => s.symbol);
			onAccept(cryptos);
		}
	}

	function getConfidenceColor(confidence: number): string {
		if (confidence >= 80) return 'text-green-600';
		if (confidence >= 60) return 'text-yellow-600';
		return 'text-orange-600';
	}

	function getConfidenceLabel(confidence: number): string {
		if (confidence >= 80) return 'High';
		if (confidence >= 60) return 'Medium';
		return 'Low';
	}
</script>

<div class="ai-suggestion-card bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200 p-6">
	<div class="flex items-center gap-2 mb-4">
		<Brain class="w-6 h-6 text-purple-600" />
		<h3 class="text-xl font-bold text-purple-900">AI Portfolio Assistant</h3>
		<Sparkles class="w-5 h-5 text-purple-400" />
	</div>

	{#if !suggestions && !loading && !error}
		<div class="text-center py-8">
			<p class="text-gray-600 mb-4">Get AI-powered portfolio suggestions based on current market conditions</p>
			<button
				onclick={onRequestSuggestions}
				class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto"
			>
				<Sparkles class="w-4 h-4" />
				Get AI Suggestions
			</button>
		</div>
	{/if}

	{#if loading}
		<div class="text-center py-8">
			<div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent mb-4"></div>
			<p class="text-purple-700 font-medium">AI is analyzing the market...</p>
		</div>
	{/if}

	{#if error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
			<p class="text-red-700">{error}</p>
			<button
				onclick={onRequestSuggestions}
				class="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
			>
				Try Again
			</button>
		</div>
	{/if}

	{#if suggestions}
		<div class="space-y-4">
			<!-- Overall Strategy -->
			<div class="bg-white rounded-lg p-4 border border-purple-200">
				<div class="flex items-center gap-2 mb-2">
					<TrendingUp class="w-4 h-4 text-purple-600" />
					<h4 class="font-semibold text-purple-900">Strategy</h4>
				</div>
				<p class="text-gray-700 text-sm">{suggestions.overallStrategy}</p>
			</div>

			<!-- Individual Suggestions -->
			<div class="space-y-2">
				{#each suggestions.suggestions as suggestion, i}
					<div class="bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-colors overflow-hidden">
						<!-- Accordion Header -->
						<button
							type="button"
							onclick={() => toggleItem(i)}
							class="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
						>
							<div class="flex items-center gap-3">
								<span class="text-lg font-bold text-gray-900">#{i + 1}</span>
								<span class="text-xl font-bold text-purple-700">{suggestion.symbol}</span>
								<div class="flex items-center gap-1">
									<span class="text-xs text-gray-500">Confidence:</span>
									<span class={`font-bold ${getConfidenceColor(suggestion.confidence)}`}>
										{suggestion.confidence}%
									</span>
								</div>
							</div>
							<div class="flex items-center gap-2">
								<span class="text-xs {getConfidenceColor(suggestion.confidence)} font-medium">
									{getConfidenceLabel(suggestion.confidence)}
								</span>
								{#if expandedItems.has(i)}
									<ChevronDown class="w-5 h-5 text-gray-400" />
								{:else}
									<ChevronRight class="w-5 h-5 text-gray-400" />
								{/if}
							</div>
						</button>
						
						<!-- Accordion Content -->
						{#if expandedItems.has(i)}
							<div class="px-4 pb-4 border-t border-gray-100">
								<p class="text-sm text-gray-600 leading-relaxed pt-3">{suggestion.reasoning}</p>
							</div>
						{/if}
					</div>
				{/each}
			</div>

			<!-- Action Buttons -->
			<div class="flex gap-3 mt-6">
				<button
					onclick={handleAcceptAll}
					class="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-medium"
				>
					<CheckCircle class="w-5 h-5" />
					Accept All Suggestions
				</button>
				<button
					onclick={onRequestSuggestions}
					class="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
				>
					Refresh
				</button>
			</div>

			<p class="text-xs text-gray-500 text-center mt-2">
				Generated {new Date(suggestions.timestamp).toLocaleTimeString()}
			</p>
		</div>
	{/if}
</div>

<style>
	.ai-suggestion-card {
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
