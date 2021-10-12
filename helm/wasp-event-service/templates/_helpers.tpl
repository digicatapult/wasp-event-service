{{/*
Create name to be used with deployment.
*/}}
{{- define "wasp-event-service.fullname" -}}
    {{- if .Values.fullnameOverride -}}
        {{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
    {{- else -}}
      {{- $name := default .Chart.Name .Values.nameOverride -}}
      {{- if contains $name .Release.Name -}}
        {{- .Release.Name | trunc 63 | trimSuffix "-" -}}
      {{- else -}}
        {{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
      {{- end -}}
    {{- end -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "wasp-event-service.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "wasp-event-service.selectorLabels" -}}
app.kubernetes.io/name: {{ include "wasp-event-service.fullname" . }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "wasp-event-service.labels" -}}
helm.sh/chart: {{ include "wasp-event-service.chart" . }}
{{ include "wasp-event-service.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Conditionally populate imagePullSecrets if present in the context
*/}}
{{- define "wasp-event-service.imagePullSecrets" -}}
  {{- if (not (empty .Values.image.pullSecrets)) }}
imagePullSecrets:
    {{- range .Values.image.pullSecrets }}
  - name: {{ . }}
    {{- end }}
  {{- end }}
{{- end -}}

{{/*
Create a default fully qualified postgresql name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
*/}}
{{- define "wasp-event-service.postgresql.fullname" -}}
{{- if .Values.config.externalPostgresql -}}
{{ .Values.config.externalPostgresql | trunc 63 | trimSuffix "-" -}}
{{- else if not ( .Values.postgresql.enabled ) -}}
{{ fail "Postgresql must either be enabled or passed via config.externalPostgresql" }}
{{- else if .Values.postgresql.fullnameOverride -}}
{{- .Values.postgresql.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default "postgresql" .Values.postgresql.nameOverride -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{/*
Create a default fully qualified kafka broker name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
*/}}
{{- define "wasp-event-service.kafka.brokers" -}}
{{- if .Values.config.kafkaBrokers -}}
{{ .Values.config.kafkaBrokers | trunc 63 | trimSuffix "-" -}}
{{- else if not ( .Values.kafka.enabled ) -}}
{{ fail "Kafka brokers must either be configured or a kafka instance enabled" }}
{{- else if .Values.kafka.fullnameOverride -}}
{{- printf "%s:9092" .Values.kafka.fullnameOverride -}}
{{- else -}}
{{- $name := default "kafka" .Values.kafka.nameOverride -}}
{{- printf "%s-%s:9092" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "wasp-event-service.initEvents.name" -}}
{{- if .Values.fullnameOverride -}}
{{- printf "%s-events" .Values.fullnameOverride | lower | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s-events" .Release.Name .Chart.Name | lower | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "wasp-event-service.initDb.name" -}}
{{- if .Values.fullnameOverride -}}
{{- printf "%s-db" .Values.fullnameOverride | lower | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s-db" .Release.Name .Chart.Name | lower | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
